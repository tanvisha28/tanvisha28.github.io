#!/usr/bin/env python3

from __future__ import annotations

import math
import shutil
import subprocess
import wave
from array import array
from dataclasses import dataclass
from pathlib import Path
from random import Random

SAMPLE_RATE = 48_000
TAU = math.tau
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
OUTPUT_DIR = REPO_ROOT / "public" / "audio"


@dataclass(frozen=True)
class AmbientProfile:
    name: str
    seed: int
    base_freq: float
    secondary_freq: float
    third_freq: float
    sub_freq: float
    pulse_freq: float
    harmonic_freq: float
    radio_freq: float
    pulse_cycles: int
    motion_a_cycles: int
    motion_b_cycles: int
    harmonic_positions: tuple[float, ...]
    warmth: float
    sub_amp: float
    pulse_amp: float
    cello_amp: float
    harmonic_amp: float
    air_amp: float
    shimmer_amp: float
    radio_amp: float
    width: float


AMBIENT_DURATION = 16.0

AMBIENT_PROFILES = (
    AmbientProfile(
        name="hero-ambient-loop",
        seed=11,
        base_freq=55.0,
        secondary_freq=82.5,
        third_freq=110.0,
        sub_freq=36.0,
        pulse_freq=165.0,
        harmonic_freq=330.0,
        radio_freq=1460.0,
        pulse_cycles=4,
        motion_a_cycles=1,
        motion_b_cycles=2,
        harmonic_positions=(0.12, 0.44, 0.77),
        warmth=0.23,
        sub_amp=0.12,
        pulse_amp=0.018,
        cello_amp=0.1,
        harmonic_amp=0.052,
        air_amp=0.035,
        shimmer_amp=0.02,
        radio_amp=0.008,
        width=0.21,
    ),
    AmbientProfile(
        name="projects-ambient-loop",
        seed=23,
        base_freq=55.0,
        secondary_freq=92.5,
        third_freq=123.75,
        sub_freq=41.25,
        pulse_freq=185.0,
        harmonic_freq=370.0,
        radio_freq=1580.0,
        pulse_cycles=6,
        motion_a_cycles=2,
        motion_b_cycles=3,
        harmonic_positions=(0.08, 0.31, 0.55, 0.8),
        warmth=0.2,
        sub_amp=0.11,
        pulse_amp=0.036,
        cello_amp=0.082,
        harmonic_amp=0.048,
        air_amp=0.03,
        shimmer_amp=0.018,
        radio_amp=0.01,
        width=0.18,
    ),
    AmbientProfile(
        name="experience-ambient-loop",
        seed=37,
        base_freq=61.875,
        secondary_freq=92.5,
        third_freq=123.75,
        sub_freq=41.25,
        pulse_freq=196.25,
        harmonic_freq=392.5,
        radio_freq=1700.0,
        pulse_cycles=8,
        motion_a_cycles=2,
        motion_b_cycles=4,
        harmonic_positions=(0.15, 0.4, 0.62, 0.87),
        warmth=0.19,
        sub_amp=0.1,
        pulse_amp=0.045,
        cello_amp=0.074,
        harmonic_amp=0.045,
        air_amp=0.025,
        shimmer_amp=0.016,
        radio_amp=0.011,
        width=0.16,
    ),
    AmbientProfile(
        name="education-ambient-loop",
        seed=49,
        base_freq=73.125,
        secondary_freq=110.0,
        third_freq=146.25,
        sub_freq=48.125,
        pulse_freq=220.0,
        harmonic_freq=440.0,
        radio_freq=1820.0,
        pulse_cycles=5,
        motion_a_cycles=1,
        motion_b_cycles=3,
        harmonic_positions=(0.19, 0.5, 0.74),
        warmth=0.17,
        sub_amp=0.085,
        pulse_amp=0.022,
        cello_amp=0.062,
        harmonic_amp=0.056,
        air_amp=0.03,
        shimmer_amp=0.024,
        radio_amp=0.009,
        width=0.19,
    ),
    AmbientProfile(
        name="contact-ambient-loop",
        seed=61,
        base_freq=65.625,
        secondary_freq=98.4375,
        third_freq=131.25,
        sub_freq=43.75,
        pulse_freq=175.0,
        harmonic_freq=350.0,
        radio_freq=1540.0,
        pulse_cycles=5,
        motion_a_cycles=1,
        motion_b_cycles=2,
        harmonic_positions=(0.18, 0.47, 0.72, 0.9),
        warmth=0.2,
        sub_amp=0.1,
        pulse_amp=0.02,
        cello_amp=0.075,
        harmonic_amp=0.06,
        air_amp=0.028,
        shimmer_amp=0.024,
        radio_amp=0.008,
        width=0.2,
    ),
    AmbientProfile(
        name="case-study-ambient-loop",
        seed=73,
        base_freq=49.5,
        secondary_freq=74.25,
        third_freq=99.0,
        sub_freq=33.0,
        pulse_freq=198.0,
        harmonic_freq=297.0,
        radio_freq=1880.0,
        pulse_cycles=7,
        motion_a_cycles=2,
        motion_b_cycles=3,
        harmonic_positions=(0.1, 0.37, 0.58, 0.82),
        warmth=0.18,
        sub_amp=0.115,
        pulse_amp=0.038,
        cello_amp=0.085,
        harmonic_amp=0.04,
        air_amp=0.02,
        shimmer_amp=0.012,
        radio_amp=0.012,
        width=0.1,
    ),
)

SHORT_CUE_DURATIONS = {
    "sound-activation-cue": 1.1,
    "ui-click": 0.14,
    "ui-hover": 0.08,
    "section-arrival": 0.65,
    "scroll-down-transition": 0.7,
    "scroll-up-transition": 0.6,
    "case-study-open": 1.2,
    "case-study-return": 1.0,
}

CURRENT_AUDIO_BASENAMES = {profile.name for profile in AMBIENT_PROFILES} | set(SHORT_CUE_DURATIONS)
LEGACY_AUDIO_BASENAMES = {
    "ambient-home-loop",
    "ambient-detail-loop",
    "activation-tone",
    "section-sweep",
    "section-impact",
    "case-study-open",
    "case-study-return",
    "ui-click",
    "ui-hover",
}


def new_buffer(sample_count: int) -> array:
    return array("f", [0.0]) * sample_count


def smoothstep(value: float) -> float:
    clamped = min(max(value, 0.0), 1.0)
    return clamped * clamped * (3.0 - 2.0 * clamped)


def circular_gaussian(position: float, center: float, width: float) -> float:
    distance = abs(position - center)
    wrapped = min(distance, 1.0 - distance)
    return math.exp(-(wrapped * wrapped) / max(width * width * 2.0, 1e-6))


def fade_edges(left: array, right: array, attack_seconds: float, release_seconds: float) -> None:
    sample_count = len(left)
    attack = min(sample_count, max(1, int(SAMPLE_RATE * attack_seconds)))
    release = min(sample_count, max(1, int(SAMPLE_RATE * release_seconds)))

    for index in range(attack):
        gain = smoothstep(index / attack)
        left[index] *= gain
        right[index] *= gain

    for index in range(release):
        gain = smoothstep(1.0 - (index / release))
        sample_index = sample_count - 1 - index
        left[sample_index] *= gain
        right[sample_index] *= gain


def add_stereo_delay(left: array, right: array, delay_seconds: float, feedback: float, mix: float) -> None:
    delay_samples = max(1, int(delay_seconds * SAMPLE_RATE))
    dry_left = array("f", left)
    dry_right = array("f", right)

    for index in range(delay_samples, len(left)):
        delayed_left = dry_left[index - delay_samples] * mix + left[index - delay_samples] * feedback
        delayed_right = dry_right[index - delay_samples] * mix + right[index - delay_samples] * feedback
        left[index] += delayed_right
        right[index] += delayed_left


def make_noise_track(sample_count: int, control_points: int, seed: int) -> array:
    rng = Random(seed)
    anchors = [rng.uniform(-1.0, 1.0) for _ in range(control_points + 1)]
    track = new_buffer(sample_count)

    for segment_index in range(control_points):
        start_index = (segment_index * sample_count) // control_points
        end_index = ((segment_index + 1) * sample_count) // control_points
        start_value = anchors[segment_index]
        end_value = anchors[segment_index + 1]
        length = max(1, end_index - start_index)

        for step in range(length):
            blend = smoothstep(step / length)
            track[start_index + step] = start_value + (end_value - start_value) * blend

    track[-1] = track[0]
    return track


def differentiate(track: array, scale: float = 1.0) -> array:
    result = new_buffer(len(track))
    previous = track[-1]
    for index, value in enumerate(track):
        result[index] = (value - previous) * scale
        previous = value
    return result


def finalize(left: array, right: array, target_peak: float, drive: float) -> tuple[array, array]:
    left_mean = sum(left) / len(left)
    right_mean = sum(right) / len(right)
    peak = 0.0

    for index in range(len(left)):
        shaped_left = math.tanh((left[index] - left_mean) * drive)
        shaped_right = math.tanh((right[index] - right_mean) * drive)
        left[index] = shaped_left
        right[index] = shaped_right
        peak = max(peak, abs(shaped_left), abs(shaped_right))

    peak = peak or 1.0
    scale = target_peak / peak
    for index in range(len(left)):
        left[index] *= scale
        right[index] *= scale

    return left, right


def write_wav(path: Path, left: array, right: array) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(2)
        handle.setsampwidth(2)
        handle.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for left_sample, right_sample in zip(left, right):
            left_pcm = max(-32767, min(32767, int(left_sample * 32767.0)))
            right_pcm = max(-32767, min(32767, int(right_sample * 32767.0)))
            frames.extend(left_pcm.to_bytes(2, "little", signed=True))
            frames.extend(right_pcm.to_bytes(2, "little", signed=True))
        handle.writeframes(frames)


def transcode_to_m4a(wav_path: Path) -> None:
    m4a_path = wav_path.with_suffix(".m4a")
    subprocess.run(
        [
            "afconvert",
            str(wav_path),
            str(m4a_path),
            "-f",
            "m4af",
            "-d",
            "aac",
            "-b",
            "256000",
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def render_ambient(profile: AmbientProfile) -> tuple[array, array]:
    sample_count = int(AMBIENT_DURATION * SAMPLE_RATE)
    left = new_buffer(sample_count)
    right = new_buffer(sample_count)
    air_noise = make_noise_track(sample_count, 2_400, profile.seed + 101)
    side_noise = differentiate(make_noise_track(sample_count, 3_600, profile.seed + 211), scale=0.55)
    radio_noise = make_noise_track(sample_count, 1_600, profile.seed + 307)
    sparkle_noise = differentiate(make_noise_track(sample_count, 4_600, profile.seed + 401), scale=0.8)

    for index in range(sample_count):
        t = index / SAMPLE_RATE
        u = index / sample_count
        slow_a = 0.5 + 0.5 * math.sin(TAU * (profile.motion_a_cycles * u + 0.13))
        slow_b = 0.5 + 0.5 * math.sin(TAU * (profile.motion_b_cycles * u + 0.61))
        pulse_env = max(0.0, math.sin(TAU * (profile.pulse_cycles * u - 0.12))) ** 3.2
        harmonic_env = sum(circular_gaussian(u, center, 0.025) for center in profile.harmonic_positions)

        drone = (
            0.72 * math.sin(TAU * profile.base_freq * t + 0.11)
            + 0.52 * math.sin(TAU * profile.secondary_freq * t + 1.37)
            + 0.36 * math.sin(TAU * profile.third_freq * t + 2.04)
        ) * (0.6 + 0.24 * slow_a + 0.16 * slow_b)
        sub = math.sin(TAU * profile.sub_freq * t + 0.42) * (0.68 + 0.32 * slow_a)
        cello = (
            0.74 * math.sin(TAU * (profile.base_freq * 0.5) * t + 1.91)
            + 0.26 * math.sin(TAU * profile.base_freq * t + 0.33)
        ) * (0.54 + 0.46 * slow_b)
        pulse = pulse_env * math.sin(TAU * profile.pulse_freq * t + 2.6)
        harmonic = harmonic_env * (
            math.sin(TAU * profile.harmonic_freq * t + 0.78)
            + 0.46 * math.sin(TAU * profile.harmonic_freq * 1.5 * t + 1.92)
        )
        air = air_noise[index] * (0.32 + 0.68 * slow_b)
        radio = radio_noise[index] * math.sin(TAU * profile.radio_freq * t + 0.27) * (0.45 + 0.55 * pulse_env)
        shimmer = sparkle_noise[index] * (0.28 + 0.72 * harmonic_env)

        mid = (
            drone * profile.warmth
            + sub * profile.sub_amp
            + cello * profile.cello_amp
            + pulse * profile.pulse_amp
            + harmonic * profile.harmonic_amp
            + air * profile.air_amp
            + radio * profile.radio_amp
        )
        side = profile.width * (
            side_noise[index] * profile.air_amp * 0.95
            + shimmer * profile.shimmer_amp
            + pulse_env * math.sin(TAU * profile.pulse_freq * 1.25 * t + 0.91) * profile.pulse_amp * 0.18
        )

        left[index] = mid + side
        right[index] = mid - side

    return finalize(left, right, target_peak=0.74, drive=1.16)


def render_activation_cue() -> tuple[array, array]:
    duration = SHORT_CUE_DURATIONS["sound-activation-cue"]
    sample_count = int(duration * SAMPLE_RATE)
    left = new_buffer(sample_count)
    right = new_buffer(sample_count)

    for index in range(sample_count):
        t = index / SAMPLE_RATE
        progress = index / sample_count
        bloom = math.exp(-3.8 * progress)
        swell = smoothstep(min(progress / 0.28, 1.0))
        body = (
            0.7 * math.sin(TAU * 261.625 * t)
            + 0.42 * math.sin(TAU * 392.0 * t + 0.31)
            + 0.2 * math.sin(TAU * 523.25 * t + 1.12)
        ) * bloom * swell
        chime = math.sin(TAU * (640.0 + 180.0 * progress) * t + 0.87) * math.exp(-5.5 * progress)
        side = math.sin(TAU * 910.0 * t + 1.73) * math.exp(-4.7 * progress) * 0.14
        left[index] = body * 0.24 + chime * 0.11 + side
        right[index] = body * 0.24 + chime * 0.11 - side

    fade_edges(left, right, 0.01, 0.22)
    add_stereo_delay(left, right, 0.09, feedback=0.18, mix=0.22)
    return finalize(left, right, target_peak=0.84, drive=1.2)


def render_ui_click() -> tuple[array, array]:
    duration = SHORT_CUE_DURATIONS["ui-click"]
    sample_count = int(duration * SAMPLE_RATE)
    left = new_buffer(sample_count)
    right = new_buffer(sample_count)

    for index in range(sample_count):
        t = index / SAMPLE_RATE
        progress = index / sample_count
        body = math.sin(TAU * 1950.0 * t) * math.exp(-34.0 * progress)
        tap = math.sin(TAU * 310.0 * t + 0.18) * math.exp(-20.0 * progress)
        side = math.sin(TAU * 2480.0 * t + 0.8) * math.exp(-28.0 * progress) * 0.12
        left[index] = body * 0.28 + tap * 0.18 + side
        right[index] = body * 0.28 + tap * 0.18 - side

    fade_edges(left, right, 0.001, 0.04)
    return finalize(left, right, target_peak=0.82, drive=1.28)


def render_ui_hover() -> tuple[array, array]:
    duration = SHORT_CUE_DURATIONS["ui-hover"]
    sample_count = int(duration * SAMPLE_RATE)
    left = new_buffer(sample_count)
    right = new_buffer(sample_count)

    for index in range(sample_count):
        t = index / SAMPLE_RATE
        progress = index / sample_count
        tone = math.sin(TAU * 2780.0 * t + 0.22) * math.exp(-48.0 * progress)
        whisper = math.sin(TAU * 3310.0 * t + 1.31) * math.exp(-52.0 * progress) * 0.32
        left[index] = tone * 0.16 + whisper * 0.06
        right[index] = tone * 0.16 - whisper * 0.06

    fade_edges(left, right, 0.001, 0.03)
    return finalize(left, right, target_peak=0.72, drive=1.24)


def render_section_arrival() -> tuple[array, array]:
    duration = SHORT_CUE_DURATIONS["section-arrival"]
    sample_count = int(duration * SAMPLE_RATE)
    left = new_buffer(sample_count)
    right = new_buffer(sample_count)

    for index in range(sample_count):
        t = index / SAMPLE_RATE
        progress = index / sample_count
        low = math.sin(TAU * 72.0 * t + 0.4) * math.exp(-7.5 * progress)
        glass = math.sin(TAU * 620.0 * t + 1.1) * math.exp(-10.0 * progress)
        shimmer = math.sin(TAU * 1240.0 * t + 2.4) * math.exp(-15.0 * progress) * 0.38
        side = math.sin(TAU * 980.0 * t + 0.65) * math.exp(-12.0 * progress) * 0.12
        left[index] = low * 0.22 + glass * 0.12 + shimmer * 0.06 + side
        right[index] = low * 0.22 + glass * 0.12 + shimmer * 0.06 - side

    fade_edges(left, right, 0.002, 0.12)
    add_stereo_delay(left, right, 0.06, feedback=0.12, mix=0.18)
    return finalize(left, right, target_peak=0.84, drive=1.22)


def render_scroll_transition(direction: str) -> tuple[array, array]:
    duration = SHORT_CUE_DURATIONS[f"scroll-{direction}-transition"]
    sample_count = int(duration * SAMPLE_RATE)
    left = new_buffer(sample_count)
    right = new_buffer(sample_count)
    noise = differentiate(make_noise_track(sample_count, 900, 809 if direction == "down" else 919), scale=0.75)

    start_freq, end_freq = (460.0, 240.0) if direction == "down" else (260.0, 420.0)

    for index in range(sample_count):
        progress = index / sample_count
        t = index / SAMPLE_RATE
        sweep_freq = start_freq + (end_freq - start_freq) * progress
        body = math.sin(TAU * sweep_freq * t + 0.71) * math.exp(-7.0 * progress)
        support = math.sin(TAU * (sweep_freq * 0.5) * t + 1.4) * math.exp(-6.0 * progress)
        dust = noise[index] * math.exp(-5.4 * progress)
        side = math.sin(TAU * (sweep_freq * 1.4) * t + 2.1) * math.exp(-8.8 * progress) * 0.12
        left[index] = body * 0.18 + support * 0.1 + dust * 0.06 + side
        right[index] = body * 0.18 + support * 0.1 + dust * 0.06 - side

    fade_edges(left, right, 0.003, 0.08)
    add_stereo_delay(left, right, 0.05, feedback=0.08, mix=0.12)
    return finalize(left, right, target_peak=0.8, drive=1.2)


def render_case_study_open() -> tuple[array, array]:
    duration = SHORT_CUE_DURATIONS["case-study-open"]
    sample_count = int(duration * SAMPLE_RATE)
    left = new_buffer(sample_count)
    right = new_buffer(sample_count)
    noise = make_noise_track(sample_count, 1_200, 1007)

    for index in range(sample_count):
        progress = index / sample_count
        t = index / SAMPLE_RATE
        descent = 420.0 - 160.0 * progress
        body = math.sin(TAU * descent * t + 0.93) * math.exp(-4.6 * progress)
        low = math.sin(TAU * 96.0 * t + 1.42) * math.exp(-3.7 * progress)
        signal = math.sin(TAU * 1840.0 * t + 0.37) * math.exp(-12.0 * progress) * (0.2 + 0.8 * noise[index] * noise[index])
        side = math.sin(TAU * 760.0 * t + 1.7) * math.exp(-8.0 * progress) * 0.14
        left[index] = body * 0.22 + low * 0.16 + signal * 0.08 + side
        right[index] = body * 0.22 + low * 0.16 + signal * 0.08 - side

    fade_edges(left, right, 0.003, 0.18)
    add_stereo_delay(left, right, 0.08, feedback=0.14, mix=0.18)
    return finalize(left, right, target_peak=0.86, drive=1.24)


def render_case_study_return() -> tuple[array, array]:
    duration = SHORT_CUE_DURATIONS["case-study-return"]
    sample_count = int(duration * SAMPLE_RATE)
    left = new_buffer(sample_count)
    right = new_buffer(sample_count)

    for index in range(sample_count):
        progress = index / sample_count
        t = index / SAMPLE_RATE
        lift = 250.0 + 180.0 * progress
        body = math.sin(TAU * lift * t + 0.42) * math.exp(-4.5 * progress)
        warmth = math.sin(TAU * 110.0 * t + 1.22) * math.exp(-3.8 * progress)
        resolve = math.sin(TAU * 560.0 * t + 2.4) * math.exp(-9.0 * progress) * smoothstep(progress / 0.45)
        side = math.sin(TAU * 840.0 * t + 0.88) * math.exp(-8.4 * progress) * 0.12
        left[index] = body * 0.18 + warmth * 0.16 + resolve * 0.08 + side
        right[index] = body * 0.18 + warmth * 0.16 + resolve * 0.08 - side

    fade_edges(left, right, 0.003, 0.18)
    add_stereo_delay(left, right, 0.07, feedback=0.12, mix=0.16)
    return finalize(left, right, target_peak=0.84, drive=1.22)


def render_all() -> dict[str, tuple[array, array]]:
    rendered: dict[str, tuple[array, array]] = {}

    for profile in AMBIENT_PROFILES:
        rendered[profile.name] = render_ambient(profile)

    rendered["sound-activation-cue"] = render_activation_cue()
    rendered["ui-click"] = render_ui_click()
    rendered["ui-hover"] = render_ui_hover()
    rendered["section-arrival"] = render_section_arrival()
    rendered["scroll-down-transition"] = render_scroll_transition("down")
    rendered["scroll-up-transition"] = render_scroll_transition("up")
    rendered["case-study-open"] = render_case_study_open()
    rendered["case-study-return"] = render_case_study_return()
    return rendered


def clean_previous_outputs(output_dir: Path) -> None:
    for basename in CURRENT_AUDIO_BASENAMES | LEGACY_AUDIO_BASENAMES:
        for suffix in (".wav", ".m4a"):
            target = output_dir / f"{basename}{suffix}"
            if target.exists():
                target.unlink()


def main() -> None:
    if shutil.which("afconvert") is None:
        raise SystemExit("afconvert is required to export .m4a files.")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    clean_previous_outputs(OUTPUT_DIR)
    rendered = render_all()

    for basename, (left, right) in rendered.items():
        wav_path = OUTPUT_DIR / f"{basename}.wav"
        write_wav(wav_path, left, right)
        transcode_to_m4a(wav_path)
        print(f"generated {wav_path.relative_to(REPO_ROOT)} and {wav_path.with_suffix('.m4a').relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
