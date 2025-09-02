#!/bin/bash
# 性能优化启动参数
python -m http.server 3000 \
  --directory ./html \
  --bind 0.0.0.0 \
  --max-requests 100 \
  --timeout 30