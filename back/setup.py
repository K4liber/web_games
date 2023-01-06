import json
from distutils.core import setup
from setuptools import find_packages

import bluff

requirements = []

with open('Pipfile.lock') as f:
    pipfile = json.load(f)
    deps = pipfile['default']
    
    for package_name, values in deps.items():
        requirements.append(f'{package_name}{values["version"]}')


setup(
    name='bluff',
    version=bluff.__version__,
    packages=find_packages('.', exclude=['*test*']),
    description='Bluff Poker',
    author='Jan Bielecki',
    author_email='janbielecki94@gmail.com',
    python_requires=">=3.9",
    install_requires=requirements
)
