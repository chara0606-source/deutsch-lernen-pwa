import os
import subprocess
import sys

script_path = sys.argv[0]

# Stage the deletion of self_destruct.py
subprocess.run(['git', 'add', '-A'], capture_output=True)

# Amend the previous commit
result = subprocess.run(['git', 'commit', '--amend', '-m', 'feat: regenerate PWA icons from dl3.png (golden retriever mascot)'], capture_output=True, text=True)
print(result.stdout, end='')
if result.stderr:
    print(result.stderr, end='')

# Force push
result = subprocess.run(['git', 'push', 'origin', 'main', '--force-with-lease'], capture_output=True, text=True)
print(result.stdout, end='')
if result.stderr:
    print(result.stderr, end='')

# Delete this script itself
if os.path.exists(script_path):
    os.remove(script_path)
