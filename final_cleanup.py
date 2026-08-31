import os
import subprocess

# Remove cleanup script from disk
if os.path.exists('cleanup.py'):
    os.remove('cleanup.py')

# Stage the deletion of run_git_ops.py and commit
def run_git(cmd):
    result = subprocess.run(['git'] + cmd, capture_output=True, text=True)
    print(result.stdout, end='')
    if result.stderr:
        print(result.stderr, end='')
    return result.returncode

run_git(['add', '-A'])
run_git(['commit', '-m', 'chore: remove temporary scripts'])
run_git(['push', 'origin', 'main'])
