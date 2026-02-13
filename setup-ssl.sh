#!/bin/bash

set -e

echo "=== Let's Encrypt SSL 인증서 발급 스크립트 ==="
echo ""

if [ -z "$1" ]; then
    echo "사용법: ./setup-ssl.sh your-domain.com your-email@example.com"
    echo ""
    echo "예시: ./setup-ssl.sh spreadlove.com admin@spreadlove.com"
    exit 1
fi

if [ -z "$2" ]; then
    echo "이메일 주소가 필요합니다."
    echo "사용법: ./setup-ssl.sh your-domain.com your-email@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "도메인: $DOMAIN"
echo "이메일: $EMAIL"
echo ""

read -p "계속하시겠습니까? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "취소되었습니다."
    exit 1
fi

echo ""
echo "[1/5] 템플릿에서 nginx 설정 파일 생성 중..."
export DOMAIN=$DOMAIN
envsubst '${DOMAIN}' < nginx/nginx.conf.template > nginx/nginx.conf
echo "✅ 완료"

echo ""
echo "[2/5] HTTP 모드로 nginx 시작 중..."
docker compose up -d nginx
sleep 3
echo "✅ 완료"

echo ""
echo "[3/5] SSL 인증서 발급 중... (1-2분 소요)"
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal

if [ $? -ne 0 ]; then
    echo "❌ SSL 인증서 발급 실패"
    echo ""
    echo "문제 해결:"
    echo "1. 도메인의 DNS A 레코드가 이 서버 IP를 가리키는지 확인"
    echo "2. 80 포트가 열려있는지 확인 (AWS 보안그룹)"
    echo "3. 도메인 이름을 정확히 입력했는지 확인"
    exit 1
fi

echo "✅ 완료"

echo ""
echo "[4/5] certbot 자동 갱신 컨테이너 시작 중..."
docker compose up -d certbot
echo "✅ 완료"

echo ""
echo "[5/5] nginx HTTPS 모드로 재시작 중..."
docker compose restart nginx
sleep 2
echo "✅ 완료"

echo ""
echo "=== SSL 설정 완료! ==="
echo ""
echo "✅ HTTPS 접속: https://$DOMAIN"
echo "✅ 인증서는 3개월마다 자동 갱신됩니다"
echo ""
echo "테스트:"
echo "  curl https://$DOMAIN/health"
echo ""
