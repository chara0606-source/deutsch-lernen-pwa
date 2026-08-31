import subprocess
import sys

def run_git(cmd):
    result = subprocess.run(['git'] + cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    return result.returncode

run_git(['add', '-A'])
run_git(['status'])
run_git(['commit', '-m', 'feat: regenerate PWA icons from dl3.png (golden retriever mascot)'])
run_git(['push', 'origin', 'main'])
