import {GameUtils} from './game-utils';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
let myDevices: string[] = [];
var plane:  BABYLON.Mesh;
var mat: BABYLON.StandardMaterial;
const MAXROW: number = 3;
const MAXCOL: number = 4;

export class Game {

    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.ArcRotateCamera;
    private _light: BABYLON.Light;
    private _sharkMesh: BABYLON.AbstractMesh;
    private _sharkAnimationTime = 0;
    private _swim: boolean = false;
    private aktPhoto: {filename:string, row: number, col:number};
    private _isCountDownStarted: boolean = false;
    private _nCountDownValue: number = 3;

    constructor(canvasElement: string) {
        // Create canvas and engine
        this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true);
    }
    createPhotoCamera(){
        plane = BABYLON.Mesh.CreatePlane('sphere1', 0.08, this._scene);
        plane.scaling.x = 404;
        plane.scaling.y = 303;
        
        plane.rotation.x = Math.PI/2;
        plane.rotation.z = -Math.PI/2;
    
         
        // Move the sphere upward 1/2 its height
        plane.position.y = 0;
            
        mat = new BABYLON.StandardMaterial('mat', this._scene);
        mat.diffuseColor = BABYLON.Color3.White();
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
              console.log('enumerateDevices() not supported.');
              return;
        }
         
        // List cameras and microphones.
        let z: number = 0;
        navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
            devices.forEach(function(device) {
            console.log(device.kind + ': ' + device.label +
                ' id = ' + device.deviceId);
            if(device.kind === 'videoinput'){
                myDevices[z] = device.deviceId;
                z += 1;
            }
         });
        })
        
        .catch(function(err) {
          console.log(err.name + ': ' + err.message);
        });
 
        BABYLON.VideoTexture.CreateFromWebCam(this._scene, function(videoTexture) {
            mat.emissiveTexture = videoTexture;
            plane.material = mat;
//    }, { minWidth: 312, minHeight: 256, maxWidth: 312, maxHeight: 256, deviceId: '473ae1ab41479702bbf882891a92cda794190afa62c9e6afda32e19e07a77f29' });
    }, { minWidth: 312, minHeight: 256, maxWidth: 1024, maxHeight: 1024, deviceId: myDevices[0] });
        
        //var postProcess = new BABYLON.AsciiArtPostProcess('AsciiArt', camera, {
        //    font: '15px Monospace'
        //});
    }
    /**
     * Creates the BABYLONJS Scene
     */
    createScene(): void {
        // create a basic BJS Scene object
        this._scene = new BABYLON.Scene(this._engine);
        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        this._camera = new BABYLON.ArcRotateCamera('Camera', 0, 0, 30, BABYLON.Vector3.Zero(), this._scene);
        this._camera.attachControl(this._canvas, true);
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        //this._light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(100, 100, 100), this._scene);
        // create the skybox
        let skybox = GameUtils.createSkybox('skybox', './assets/texture/skybox/TropicalSunnyDay', this._scene);
        // creates the sandy ground
        let ground = GameUtils.createGround(this._scene);
       
        this.createPhotoCamera();
    /***************************************************************************************************
        sidebar menu -main
    ****************************************************************************************************/ 

        var sMenu: string[] = ['VideoInput','Choose','Shoot'];
        var gridGUI: GUI.StackPanel = GameUtils.createGUIMatrix(this._scene, sMenu);
        var button: GUI.Control;
        var actVideoInput: number = 0;
        
         /*****************************************************************
            Menu:VideoInput
         *****************************************************************/
         button = gridGUI.getChildByName('but0');        // Menu:VideoInput
        button.onPointerUpObservable.add(()=>{
            console.log('GUI:', sMenu[0]);
            actVideoInput += 1;
            console.log('GUI:ChangeOfVideosource', myDevices[actVideoInput]);
            if (actVideoInput > myDevices.length -1) actVideoInput =0;
                BABYLON.VideoTexture.CreateFromWebCam(this._scene, function(videoTexture) {
                        mat.emissiveTexture = videoTexture;
                    plane.material = mat;
                } , { minWidth: 312, minHeight: 256, maxWidth: 1024, maxHeight: 1024, deviceId: myDevices[actVideoInput] });
                        
        })
        /*****************************************************************
            Menu:Choose
        *****************************************************************/
        button = gridGUI.getChildByName('but1');
        button.onPointerUpObservable.add(()=>{
            console.log('GUI:', sMenu[1]);
            gridMatrix.left = 0;
            gridPhotoBackground.left = '3000px';
        });
        /*****************************************************************
            Menu:Shoot
        *****************************************************************/
        button = gridGUI.getChildByName('but2');
        button.onPointerUpObservable.add(()=>{
            console.log('GUI:', sMenu[2]);
            gridMatrix.left = '0px';
            gridMatrix._markAsDirty();
            gridPhotoBackground.left = '3000px';
        });
         
        /***************************************************************************************************
            photo matrix
        ****************************************************************************************************/ 
        let gridMatrix: GUI.Grid= GameUtils.createMatrix(this._scene);
        gridMatrix.left = 3000;
        /***************************************************************************************************
            photobackground for shooting
        ****************************************************************************************************/ 
       let photos: GUI.Control[] = [];
        let gridPhotoBackground: GUI.StackPanel = GameUtils.createPhotoBackground(this._scene,'./assets/photos/0.0.jpg');
        let ctrl: GUI.Control = gridPhotoBackground.getChildByName('aktuellesPhoto');
        ctrl.onPointerUpObservable.add(()=>{
            console.log('GUI:CLICK');
            gridMatrix.left = 0;
            gridPhotoBackground.left = '3000px';
        })
       
    /***************************************************************************************************
        all photos are clickable
    ****************************************************************************************************/ 

        for(var z = 0;  z < 4; z++) {
            for (var zz = 0; zz < 3; zz++) {
                photos[z * 10 + zz] = gridMatrix.getChildByName('photo' + z +'.' + zz);
                photos[z * 10 + zz].onPointerUpObservable.add(
                    function(){
                
                        this.aktPhoto = {filename:'', col:-1, ro:-1};
                        this.aktPhoto.filename = String(this.btn.name).substr(0,5);
                        this.aktPhoto.row = String(this.btn.name).substr(5,1);
                        this.aktPhoto.col = String(this.btn.name).substr(7,1);
                        this.aktPhoto.filename = './assets/photos/' + this.aktPhoto.row + '.' + this.aktPhoto.col + '.jpg';
                        
                        gridPhotoBackground.removeControl(gridPhotoBackground.getChildByName('aktuellesPhoto'));
                        
                        let image : GUI.Image;
                        image = new GUI.Image('aktuellesPhoto', this.aktPhoto.filename);
                        image.stretch = GUI.Image.STRETCH_NONE;
                        image.width = '1616px';
                        image.height = '1212px';
                        image.scaleX = 0.5;
                        image.scaleY = 0.5;

                        gridPhotoBackground.addControl(image);
                        gridPhotoBackground.left = 0;
                        gridPhotoBackground.alpha = 0.3;
                        gridMatrix.left = 3000;  // hide GUIMatrix
                    
                        console.log('GUI:filename:', this.aktPhoto.filename,this.aktPhoto.filename);
                        console.log('GUI:row', this.aktPhoto.row);
                        console.log('GUI:col', this.aktPhoto.col);
                    }.bind({btn: photos[z * 10 + zz]}))
                }
            }
        }

    private CountDown(time: number){
        
        if(this._isCountDownStarted){
            console.log(this._nCountDownValue -= time);
        }
    }
    /***************************************************************************************************
        Starts the animation loop.
    ****************************************************************************************************/ 
    animate(): void {
        this._scene.registerBeforeRender(() => {
            let deltaTime: number = (1 / this._engine.getFps());
            this.animateShark(deltaTime);
            this.CountDown(deltaTime);
        });

        // run the render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        // the canvas/window resize event handler
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    animateShark(deltaTime: number): void {
        if (this._sharkMesh && this._swim) {
            this._sharkAnimationTime += deltaTime;            
            this._sharkMesh.getChildren().forEach(
                mesh => {
                    let vertexData = BABYLON.VertexData.ExtractFromMesh(mesh as BABYLON.Mesh);
                    let positions = vertexData.positions;
                    let numberOfPoints = positions.length / 3;
                    for (let i = 0; i < numberOfPoints; i++) {
                        positions[i * 3] +=
                            Math.sin(0.2 * positions[i * 3 + 2] + this._sharkAnimationTime * 3) * 0.1;
                    }
                    vertexData.applyToMesh(mesh as BABYLON.Mesh);
                }
            );
        }
    }

}