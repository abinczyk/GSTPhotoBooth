import {GameUtils} from './game-utils';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
let myDevices: string[] = [];
var plane:  BABYLON.Mesh;
var mat: BABYLON.StandardMaterial;
const MAXROW: number = 3;
const MAXCOL: number = 4;
var myCamera: BABYLON.ArcRotateCamera;
var nCountDownValue: number = 3;

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
    private  GUICountDown:GUI.AdvancedDynamicTexture;
    private gunshot:BABYLON.Sound;

    constructor(canvasElement: string) {
        // Create canvas and engine
        this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true,{ preserveDrawingBuffer: true, stencil: true });
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
        myCamera = this._camera;
        this.GUICountDown =  GUI.AdvancedDynamicTexture.CreateFullscreenUI("CountDown");
        

        // Sounds
        this.gunshot = new BABYLON.Sound("gunshot", "./assets/sounds/flap-short1.wav", this._scene);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        //this._light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(100, 100, 100), this._scene);
        // create the skybox
        let skybox = GameUtils.createSkybox('skybox', './assets/texture/skybox/TropicalSunnyDay', this._scene);
        // creates the sandy ground
        let ground = GameUtils.createGround(this._scene);
       
        this.createPhotoCamera();
        /***************************************************************************************************
            sidebar menu - main
        ****************************************************************************************************/ 

        var sMenu: string[] = ['Start','Options'];
        var gridGUIMain: GUI.StackPanel = GameUtils.createGUI(this._scene, sMenu);
        gridGUIMain.left = 0;
        var button: GUI.Control;
        
        /*****************************************************************
         MenuItem: Start
        *****************************************************************/
        button = gridGUIMain.getChildByName('but0');        // Menu:VideoInput
        button.onPointerUpObservable.add(()=>{
            console.log('GUI:', sMenu[0]);
            gridMatrix.left = 0;
            gridGUIMain.left = 3000;
        })
        /*****************************************************************
             MenuItem: Options
        *****************************************************************/
        button = gridGUIMain.getChildByName('but1');
        button.onPointerUpObservable.add(()=>{
            console.log('GUI:', sMenu[1]);
            gridGUIOptions.left = 0;
            gridPhotoBackground.left = 0;
            gridGUIMain.left = 3000;
        });
        /***************************************************************************************************
            sidebar menu - options
        ****************************************************************************************************/ 

        var sMenu: string[] = ['VideoInput','Size','CountDown-Timer','Cancel'];
        var gridGUIOptions: GUI.StackPanel = GameUtils.createGUI(this._scene, sMenu);
        var button: GUI.Control;
        var actVideoInput: number = 0;
        
         /*****************************************************************
            MenuItem: VideoInput
         *****************************************************************/
         button = gridGUIOptions.getChildByName('but0');        // Menu:VideoInput
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
            MenuItem: Size
        *****************************************************************/
        button = gridGUIOptions.getChildByName('but1');
        button.onPointerUpObservable.add(()=>{
            console.log('GUI:', sMenu[1]);
            gridMatrix.left = 0;
            gridPhotoBackground.left = '3000px';
        });
        var header = new GUI.TextBlock();
        header.text = "Size: 0";
        header.height = "30px";
        header.color = "white";
        gridGUIOptions.addControl(header); 
        var slider = new GUI.Slider();
        slider.minimum = 0;
        slider.maximum = 60;
        slider.value = 0;
        slider.height = "20px";
        slider.width = "200px";
        slider.onValueChangedObservable.add(function(value) {
            header.text = "Grösse: " + Math.round(value);
            myCamera.radius = value;
        });
        gridGUIOptions.addControl(slider);    
        /*****************************************************************
            MenuItem: CountDown
        *****************************************************************/
       var header1 = new GUI.TextBlock();
       header1.text = "Timer: " + nCountDownValue;
       header1.height = "30px";
       header1.color = "white";
       gridGUIOptions.addControl(header1); 
       var slider1 = new GUI.Slider();
       slider1.minimum = 3;
       slider1.maximum = 10;
       slider1.value = 0;
       slider1.height = "20px";
       slider1.width = "200px";
       slider1.onValueChangedObservable.add(function(value) {
            nCountDownValue = Math.round(value);
            header1.text = "Timer: " + nCountDownValue;
       });
       gridGUIOptions.addControl(slider1);    
            /*****************************************************************
             MenuItem: Cancel
        *****************************************************************/
        button = gridGUIOptions.getChildByName('but3');
        button.onPointerUpObservable.add(()=>{
            console.log('GUI:', sMenu[2]);
            gridGUIMain.left = '0px';
            gridPhotoBackground.left = 3000;
            gridGUIOptions.left = '3000px';
        });

    /***************************************************************************************************
        sidebar menu - shoot
    ****************************************************************************************************/ 

   sMenu = ['Shoot','Abbrechen'];
   var gridGUIShoot: GUI.StackPanel = GameUtils.createGUI(this._scene, sMenu);
   var button: GUI.Control;
   
    /*****************************************************************
       MenuItem: Shoot
    *****************************************************************/
    button = gridGUIShoot.getChildByName('but0');        // Menu:VideoInput
    button.onPointerUpObservable.add(()=>{
       console.log('GUI:', sMenu[0]);
       actVideoInput += 1;
       console.log('GUI:Shoot|Shoot');
        //TODO: Countdown Timer starten
        this.CountDown(nCountDownValue); 

    })
   /*****************************************************************
       MenuItem: Abbrechen
   *****************************************************************/
   button = gridGUIShoot.getChildByName('but1');
   button.onPointerUpObservable.add(()=>{
       console.log('GUI:', sMenu[1]);
       gridGUIMain.left = 0;
       gridGUIShoot.left = 3000;
       gridPhotoBackground.left = 3000;
   });
 
        /***************************************************************************************************
            photo matrix
        ****************************************************************************************************/ 
        let gridMatrix: GUI.Grid= GameUtils.createMatrix(this._scene);
        gridMatrix.left = 3000;
        let photos: GUI.Control[] = [];
        
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
                    gridGUIShoot.left = 0;
                                    
                    console.log('GUI:filename:', this.aktPhoto.filename,this.aktPhoto.filename);
                    console.log('GUI:row', this.aktPhoto.row);
                    console.log('GUI:col', this.aktPhoto.col);
                }.bind({btn: photos[z * 10 + zz]}))
            }
        }
        /***************************************************************************************************
            photobackground for shooting
        ****************************************************************************************************/

        let gridPhotoBackground: GUI.StackPanel = GameUtils.createPhotoBackground(this._scene,'./assets/photos/0.0.jpg');
        let ctrl: GUI.Control = gridPhotoBackground.getChildByName('aktuellesPhoto');
        ctrl.scaleX = 0.5;
        ctrl.scaleY = 0.5;
        ctrl.alpha = 0.3;

        ctrl.onPointerUpObservable.add(()=>{
            console.log('GUI:CLICK');
            gridMatrix.left = 0;
            gridPhotoBackground.left = '3000px';   
            this.CountDown(nCountDownValue); 
        })
       
    }
    

    private CountDown(time: number){
        
        var i = 5; // seconds

        let grid:GUI.StackPanel = new GUI.StackPanel("CountDown");
        grid.left = "0px";
        grid.top = "0px";
        grid.width = "300px";
        grid.height = "300px";
              
        
        let textBlock: GUI.TextBlock = new GUI.TextBlock("text", String(i));   
        textBlock.height = "300px";
        textBlock.fontSize = 300;
        textBlock.color = "grey";
        grid.addControl(textBlock);
        let ctrl: GUI.Button = new GUI.Button("text");   
        grid.addControl(ctrl);
        this.GUICountDown.addControl(grid);

        var handle = window.setInterval(() => {
            i--;
            textBlock.text = String(i);

            if (i === 0) {
                window.clearInterval(handle);
                // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
                this.gunshot.play();
                // Move the sphere upward 1/2 its height
                BABYLON.Tools.CreateScreenshotUsingRenderTarget(this._engine, this._camera, { width: 1024, height:1024 });
                /*
                BABYLON.Tools.CreateScreenshotUsingRenderTarget(this._engine, this._camera,  { width: 1024, height: 300 },
                        function (data) {
                       var img = window.document.createElement("img");
                       img.src = data;
                       //img.href =data;
                       //img. = data;
                      
                      // a.href = imageurl;
                      var date = new Date();
                    var stringDate = (date.getFullYear() + "-" + (date.getMonth() + 1)).slice(-2) + "-" + date.getDate() + "_" + date.getHours() + "-" + ('0' + date.getMinutes()).slice(-2);
                    img.setAttribute("download", "screenshot_" + stringDate + ".png");
                    img.setAttribute("href", data)
                      // img.setAttribute("download", "dynamictexture.png");
           
                       window.document.body.appendChild(img);
           
                       img.addEventListener("click", function() {
                           img.parentElement.removeChild(img);
                       });
                       img.click();
           
//                       document.body.appendChild(img);
                    }); */
                textBlock.dispose();
                grid.dispose();
            }
        }, 1000);
    }
    /***************************************************************************************************
        Starts the animation loop.
    ****************************************************************************************************/ 
    animate(): void {
        this._scene.registerBeforeRender(() => {
            let deltaTime: number = (1 / this._engine.getFps());
            this.animateShark(deltaTime);
 //           this.CountDown(deltaTime);
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