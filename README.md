
# Gargantia Editor

## Introduction

This repository contains all the code required to run and edit the first mission of [Gargantia: Sky Courier](http://fly.gargantia.jp) a 3D arcade flight simulator based on the [Turbulenz Engine](http://github.com/turbulenz/turbulenz_engine). The developer teardown article on [Modern.IE](http://www.modern.ie/en-us/demos/gargantia) gives an introduction to the project and the technology, while this README contains all the technical info you need to get up and running!

## Installation

To get started all you need is the code in this repository and a simple web server. First of all download this code to your computer either using git clone, or if you don't have git installed by clicking on the link to the right of this page to download the code in a zip file. Make a note of where you unpack the code or clone the repository - we will refer to that directory as the **project root** directory in the next steps.

## Running a web server

To actually see the code running you will need two things, a web server and a modern web browser that supports WebGL, such as Internet Explorer 11, Chrome or Firefox. If you have a simple web server already installed then you just need to point it at the root directory, there is an index.html file that will load and run the project. If not then you can try either of these simple options:

### Python: SimpleHTTPServer

First of all install Python (for best results we recommend using Python 2.7 32 bit) on your system (installers for most systems can be [found here](http://python.org)). Once python is installed, open a command line and navigate to the **project root** directory then simply run:

```
python -m SimpleHTTPServer
```

If installing python did not add it to your system path then you may need to explicitly give the path to your python interpreter, for example:

```
c:\Python27\python -m SimpleHTTPServer
```

Your firewall may ask for permission to allow python to access the network - you will need to allow this to be able to access the webserver from your browser.

### Node.js: http-server

To use the node http server, first of all install node.js on your system (installers for most systems can be [found here](http://nodejs.org)). Once node is installed, install the simple Http Server module using npm. Simply open up a command line and run:

```
npm install http-server -g
```

Then navigate to the **project root** directory and run

```
http-server -p 8000
```

Your firewall may ask for permission to allow node.js to access the network - you will need to allow this to be able to access the webserver from your browser.

### Running the sample

With your chosen web server running you simply need to open a web browser and navigate to http://localhost:8000

## The Game

### Controls

To start with you probably just want to try out the game to see how it works. The controls are simple, use 'WASD' or the arrow keys to fly the surf-kite around. To complete the level you must fly through the rings in order before time runs out. You can boost with the space bar to give yourself a little extra speed.

### Tweaking the game

To the left of the screen you can see the DynamicUI panel. Various sections of the UI can be expanded by clicking on them to offer up a number of checkboxes and other controls that allow you to inspect and tweak the game while it is running. Try clicking on **Debug Draw** and then selecting **Camera** to see how the camera is dragged around by the hero character.

## The Editor

At any point you can hit **enter** to drop into editor mode. In this mode you can edit and add entities to the level and save your results. Hitting **enter** again will switch back into game mode putting you at the start of the level with any changes you have made.

To make permanent changes to the level just hit the Save button in the Editor section of the DynamicUI panel. These changes will be saved locally in your browser and can then be loaded again using the Load button.

## The Code

As this is a debug build of the game all the source files are loaded every time the game is run, so to make changes to the source code you just need to change one of the files and hit reload.

The code is organised into several directories:

- :file_folder: **css** Styles for the page
- :file_folder: **dynamicui** code and styles for the controls in the side panel
 - :file_folder: **client** In-game code to activate the UI
 - :file_folder: **lib** External libraries used by the UI
 - :file_folder: **server** Runs the UI on the page
- :file_folder: **game** The game code
 - :file_folder: **assets** The mission file used by the sample
 - :file_folder: **editor** The Turbulenz in-game editor code
 - :file_folder: **jslib** The Turbulenz library
 - :file_folder: **scripts** The game code for the Gargantia Sky Courier sample
- :file_folder: **img** Images used by the page
- :file_folder: **staticmax** Assets (textures, sounds and other files) used by the game
- :scroll: **README.md** This file
- :scroll: **index.html** The main page of the web app
- :scroll: **mapping_table.json** This file maps from human-friendly asset names to the names of the files in the staticmax directory.

Most of the interesting code you will want to experiment with is in the **game/scripts** directory. Here you can find files such as **game/scripts/entitycomponents/eclocomotion.js** that controls the movement of the main character.

## License

The software in this repository is provided under the conditions specified in the [LICENSE](LICENSE) file

## Links

- [Gargantia: Sky Courier](http://fly.gargantia.jp)
- [Turbulenz Engine](http://github.com/turbulenz/turbulenz_engine)
- [Modern.IE Article (English)](http://www.modern.ie/en-us/demos/gargantia)
- [Modern.IE Article (Japanese)](http://www.modern.ie/ja-jp/demos/gargantia)
- [Turbulenz](http://turbulenz.com)

## Credits

The work provided in this repository is Copyright Turbulenz Limited 2014 unless stated otherwise.

Our thanks to all involved at Turbulenz, Microsoft and Production IG.

