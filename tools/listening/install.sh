#!/bin/bash
# Installs zr-listening on this Mac and starts its setup.
# Run it in Terminal with:
#   bash -c "$(curl -fsSL https://raw.githubusercontent.com/zamilurpersonal-source/personal_website/main/tools/listening/install.sh)"
set -eo pipefail

DIR="$HOME/.zr-listening"
RAW="https://raw.githubusercontent.com/zamilurpersonal-source/personal_website/main/tools/listening"

echo "Installing zr-listening in $DIR"
mkdir -p "$DIR"
chmod 700 "$DIR"
curl -fsSL "$RAW/zr_listening.py" -o "$DIR/zr_listening.py"

# uv runs the script with its own Python and libraries, without touching the Mac's Python.
if command -v uv >/dev/null 2>&1; then
  UV="$(command -v uv)"
elif [ -x "$HOME/.local/bin/uv" ]; then
  UV="$HOME/.local/bin/uv"
else
  echo "Installing uv (a small tool that runs Python scripts with what they need)..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  UV="$HOME/.local/bin/uv"
fi

cat > "$DIR/zr-listening" <<EOF
#!/bin/bash
# Runs zr-listening: setup, update, preview, status or uninstall.
exec "$UV" run --quiet "$DIR/zr_listening.py" "\$@"
EOF
chmod +x "$DIR/zr-listening"

echo "Getting things ready (the first time takes a minute)..."
exec "$DIR/zr-listening" setup "$@"
