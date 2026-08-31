import subprocess
import sys

print("Running: git add -A")
r1 = subprocess.run(["git", "add", "-A"], capture_output=True, text=True)
print(r1.stdout)
if r1.stderr:
    print(r1.stderr, file=sys.stderr)

print("Running: git commit -m 'fix: fill transparent background in icons with slate blue'")
r2 = subprocess.run(["git", "commit", "-m", "fix: fill transparent background in icons with slate blue"], capture_output=True, text=True)
print(r2.stdout)
if r2.stderr:
    print(r2.stderr, file=sys.stderr)

print("Running: git push origin main")
r3 = subprocess.run(["git", "push", "origin", "main"], capture_output=True, text=True)
print(r3.stdout)
if r3.stderr:
    print(r3.stderr, file=sys.stderr)
