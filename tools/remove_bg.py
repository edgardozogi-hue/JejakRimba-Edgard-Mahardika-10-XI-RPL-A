import os
import sys
from rembg import remove, new_session

SRC = r"C:\Users\M S I\jejak-rimba\app\asset\rute_perjalanan"
DST = r"D:\jejak-rimba-assets\rute_perjalanan"

FILES = ["tenda_besar.jpg", "tenda_kecil.jpg", "tas.jpg", "jaket.jpg"]

def main():
    os.makedirs(DST, exist_ok=True)
    session = new_session("isnet-general-use")
    for name in FILES:
        src_path = os.path.join(SRC, name)
        if not os.path.exists(src_path):
            print(f"SKIP (not found): {name}")
            continue
        base = os.path.splitext(name)[0]
        out_path = os.path.join(DST, base + ".png")
        print(f"Processing: {name} ...", flush=True)
        with open(src_path, "rb") as f:
            in_bytes = f.read()
        out_bytes = remove(in_bytes, session=session)
        with open(out_path, "wb") as f:
            f.write(out_bytes)
        print(f"  -> {out_path} ({len(out_bytes)} bytes)", flush=True)
    print("DONE")

if __name__ == "__main__":
    main()