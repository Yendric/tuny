"""Writes .playwright/mic.wav: plucks that start sharp, with a noisy attack and weak fundamental."""

import math
import random
import struct
import wave

SR = 48000
LENGTH = 12.0

# (start s, frequency Hz, cents off, fundamental strength)
PLUCKS = [
    (0.0, 82.41, -20, 0.08),
    (3.0, 110.0, -6, 0.2),
    (4.5, 110.0, -6, 0.2),
    (6.0, 146.83, 12, 0.5),
    (9.0, 196.0, 0, 0.8),
]

random.seed(1)
out = [0.0] * int(SR * LENGTH)

for i, (start, f0, detune, fundamental) in enumerate(PLUCKS):
    end = PLUCKS[i + 1][0] if i + 1 < len(PLUCKS) else LENGTH
    n0, n1 = int(start * SR), int(end * SR)
    phases = [0.0] * 12
    for n in range(n0, n1):
        t = (n - n0) / SR
        cents = detune + 15 * math.exp(-t / 0.12)
        f = f0 * 2 ** (cents / 1200)
        damp = min(1.0, (n1 - n) / (0.05 * SR))
        s = 0.0
        for k in range(1, 13):
            amp = abs(math.sin(math.pi * k * 0.13)) / k * (fundamental if k == 1 else 1)
            phases[k - 1] += 2 * math.pi * k * f * (1 + 1e-4 * k * k) / SR
            s += amp * math.exp(-t * (0.4 + 0.5 * k)) * math.sin(phases[k - 1])
        s += random.uniform(-1, 1) * 1.5 * math.exp(-t / 0.03)
        s += 0.04 * math.sin(2 * math.pi * 246.94 * n / SR) + 0.03 * math.sin(2 * math.pi * 329.63 * n / SR)
        out[n] += s * math.exp(-t / 2.5) * damp

out = [s + random.gauss(0, 0.01) for s in out]
peak = max(abs(s) for s in out)
with wave.open('.playwright/mic.wav', 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(s / peak * 20000)) for s in out))
