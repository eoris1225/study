#!/bin/sh
# 생명과학 페이지 캐시 갱신: bio.html과 모듈 import 주소의 ?v= 를 모두 같은 값으로
V=$(date +%Y%m%d%H%M)
sed -i -E "s#\?v=[0-9]+#?v=$V#g" bio.html
sed -i -E "s#(from '\./[a-z_]+\.js)\?v=[0-9]+'#\1?v=$V'#g" js/bio/*.js
echo "$V"
