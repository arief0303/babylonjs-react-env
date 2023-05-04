import React from "react";
import * as BABYLON from "babylonjs";
import SceneComponent from 'babylonjs-hook';
import { CharacterController } from "babylonjs-charactercontroller";
import "@babylonjs/core";
import "@babylonjs/loaders";
import "./App.css";
import Stats from "stats-js";

var statsFPS = new Stats();
statsFPS.domElement.style.cssText = "position:absolute;top:3px;left:3px;";
statsFPS.showPanel(0); // 0: fps,

var statsMemory = new Stats();
statsMemory.showPanel(2); //2: mb, 1: ms, 3+: custom
statsMemory.domElement.style.cssText = "position:absolute;top:3px;left:84px;";

//add stats for FPS and Memory usage
document.body.appendChild(statsFPS.dom);
document.body.appendChild(statsMemory.dom);

const onSceneReady = (scene) => {
  loadPlayer(scene, scene.getEngine(), scene.getEngine().getRenderingCanvas());

  // This creates and positions a free camera (non-mesh)
  // const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

  // This targets the camera to scene origin
  // camera.setTarget(Vector3.Zero());

  // const canvas = scene.getEngine().getRenderingCanvas();

  // This attaches the camera to the canvas
  // camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  // Our built-in 'box' shape.
  // box = MeshBuilder.CreateBox("box", { size: 2 }, scene);

  // Move the box upward 1/2 its height
  // box.position.y = 1;

  // Our built-in 'ground' shape.
  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
  ground.checkCollisions = true;
};

/**
 * Will run on every frame render.  We are spinning the box on y-axis.
 */
const onRender = (scene) => {
  /* if (box !== undefined) {
    const deltaTimeInMillis = scene.getEngine().getDeltaTime();

    const rpm = 10;
    box.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
  } */


  //update stats
  statsFPS.update();
  statsMemory.update();
};

function loadPlayer(scene, engine, canvas) {
  BABYLON.SceneLoader.ImportMesh("", "assets/player/", "Vincent.babylon", scene, (meshes, particleSystems, skeletons) => {
    var player = meshes[0];
    var skeleton = skeletons[0];
    player.skeleton = skeleton;

    skeleton.enableBlending(0.1);
    //if the skeleton does not have any animation ranges then set them as below
    // setAnimationRanges(skeleton);

    var sm = player.material;
    if (sm.diffuseTexture != null) {
      sm.backFaceCulling = true;
      sm.ambientColor = new BABYLON.Color3(1, 1, 1);
    }


    player.position = new BABYLON.Vector3(0, 12, 0);
    player.checkCollisions = true;
    player.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
    player.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

    //rotate the camera behind the player
    var alpha = -player.rotation.y - 4.69;
    var beta = Math.PI / 2.5;
    var target = new BABYLON.Vector3(player.position.x, player.position.y + 1.5, player.position.z);

    console.log("laoding meshes 1.1");
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", alpha, beta, 5, target, scene);

    //standard camera setting
    camera.wheelPrecision = 15;
    camera.checkCollisions = false;
    //make sure the keyboard keys controlling camera are different from those controlling player
    //here we will not use any keyboard keys to control camera
    camera.keysLeft = [];
    camera.keysRight = [];
    camera.keysUp = [];
    camera.keysDown = [];
    //how close can the camera come to player
    camera.lowerRadiusLimit = 2;
    //how far can the camera go from the player
    camera.upperRadiusLimit = 20;
    camera.attachControl(canvas, false);

    //var CharacterController = org.ssatguru.babylonjs.component.CharacterController;
    var cc = new CharacterController(player, camera, scene);
    //below makes the controller point the camera at the player head which is approx
    //1.5m above the player origin
    cc.setCameraTarget(new BABYLON.Vector3(0, 1.5, 0));

    //if the camera comes close to the player we want to enter first person mode.
    cc.setNoFirstPerson(false);
    //the height of steps which the player can climb
    cc.setStepOffset(0.4);
    //the minimum and maximum slope the player can go up
    //between the two the player will start sliding down if it stops
    cc.setSlopeLimit(30, 60);

    //tell controller 
    // - which animation range should be used for which player animation
    // - rate at which to play that animation range
    // - wether the animation range should be looped
    //use this if name, rate or looping is different from default
    cc.setIdleAnim("idle", 1, true);
    cc.setTurnLeftAnim("turnLeft", 0.5, true);
    cc.setTurnRightAnim("turnRight", 0.5, true);
    cc.setWalkBackAnim("walkBack", 0.5, true);
    cc.setIdleJumpAnim("idleJump", .5, false);
    cc.setRunJumpAnim("runJump", 0.6, false);
    //set the animation range name to "null" to prevent the controller from playing
    //a player animation.
    //here even though we have an animation range called "fall" we donot want to play 
    //the fall animation
    cc.setFallAnim("fall", 2, false);
    cc.setSlideBackAnim("slideBack", 1, false)

    cc.start();

    engine.runRenderLoop(function () {
      scene.render();
    });

  });
}

export default () => (
  <div>
    <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
  </div>
);