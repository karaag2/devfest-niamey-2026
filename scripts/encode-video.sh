#!/usr/bin/env bash
# Re-encode the 6s loops (silent, seamless) into light mobile-friendly MP4s + first-frame PNGs
# (scripts/optimize.py turns the PNG frames into WebP posters).
# Usage: bash scripts/encode-video.sh   (needs ffmpeg)
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=media/video
mkdir -p "$OUT"
for f in assets/videos/V0*_loop_16x9.mp4 assets/videos/V0*_loop_9x16.mp4; do
  base=$(basename "$f" .mp4)             # V01_open-head-ideas_loop_16x9
  code=${base%%_*}                       # V01
  rest=${base#*_}; slug=${rest%_loop_*}  # open-head-ideas
  fmt=${base##*_}                        # 16x9 | 9x16
  if [ "$fmt" = "16x9" ]; then scale="scale=1280:720"; crf=30; else scale="scale=540:960"; crf=29; fi
  ffmpeg -y -loglevel error -i "$f" -an -vf "$scale" -c:v libx264 -preset slow -crf $crf \
    -pix_fmt yuv420p -profile:v main -movflags +faststart "$OUT/${code}_${slug}_${fmt}.mp4"
  # first frame = the key visual in this aspect ratio (used as poster)
  mkdir -p "$OUT/_frames"
  ffmpeg -y -loglevel error -i "$f" -frames:v 1 -vf "$scale" "$OUT/_frames/${code}_${slug}_${fmt}.png"
  echo "ok $code $fmt $(du -h "$OUT/${code}_${slug}_${fmt}.mp4" | cut -f1)"
done
