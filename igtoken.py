"""Token de Instagram ("API con inicio de sesión de Instagram", dura 60 días).

El más nuevo lo guarda ig_token.yml (cada mes) cifrado en ig_token.enc, igual que el de TikTok.
La clave es "ig:" + YT_CLIENT_SECRET (un secreto que ya existe), así el repo público no muestra nada.
Si el archivo no está o no se puede leer, se usa el secreto IG_TOKEN.
"""
import os, subprocess
from pathlib import Path

ENC = Path(__file__).resolve().parent / "ig_token.enc"


def _key():
    k = os.environ.get("YT_CLIENT_SECRET")
    return "ig:" + k if k else None


def load():
    key = _key()
    if ENC.exists() and key:
        try:
            r = subprocess.run(["openssl", "enc", "-d", "-aes-256-cbc", "-pbkdf2", "-a", "-A", "-pass", "env:IGPASS"],
                               input=ENC.read_text().strip() + "\n", capture_output=True, text=True,
                               env={**os.environ, "IGPASS": key}, check=True)
            if r.stdout.strip():
                return r.stdout.strip()
        except Exception:
            print("[ig] No pude leer ig_token.enc: uso el secreto IG_TOKEN", flush=True)
    return os.environ.get("IG_TOKEN")


def save(token):
    key = _key()
    if not key:
        raise RuntimeError("Falta YT_CLIENT_SECRET para cifrar el token de Instagram")
    r = subprocess.run(["openssl", "enc", "-aes-256-cbc", "-pbkdf2", "-salt", "-a", "-A", "-pass", "env:IGPASS"],
                       input=token, capture_output=True, text=True, env={**os.environ, "IGPASS": key}, check=True)
    ENC.write_text(r.stdout.strip() + "\n")
