"use strict";

	let list_of_lists = [];
	function get_words(n_max) {
		for (let n = 0; n <= n_max; ++n) {
			list_of_lists[n] = WORD_RUS_LIST.filter(it => it.length === n);
		}
		// for (let n = 0; n <= n_max; ++n) {
			// console.log('[', n, ']', list_of_lists[n].length);
		// }
	}
	get_words(8);

function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let camera, scene, renderer, stats;
let time, obj1, obj2;
let clock = new THREE.Clock();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let play = 0, moveDown = 0, moveUp = 0, moveLeft = 0, moveRight = 0;
let left = 0, right = 0, up = 0, down = 0;
let difficulty = 'easy', colorBlock = 'wood';
// let floorWidth = 150, floorHeight = 150, clearBlock = 0;
let floorWidth = 320, floorHeight = 320, clearBlock = 0;

let N = 8, Z = N * N + 0;

let blockSize = floorWidth / N - 0;
let leftFloor = -floorWidth/2 + blockSize/2;
let topFloor  = floorHeight/2 - blockSize/2;

let textureNumbers = [];
function loadTexture(numberTexture) {
  // for(let i = 0; i < 16; i++) {
    // textureNumbers[i] = new THREE.TextureLoader().load( "assets" + numberTexture + "/text" + (i+1) + ".jpg" );
  // }
  for(let i = 0; i < 32; i++) {
    textureNumbers[i] = new THREE.TextureLoader().load( "a" + "/" + i + ".png" );
  }
}

let mas0 = [
  // [ 1, 2, 3, 4],
  // [ 5, 6, 7, 8],
  // [ 9,10,11,12],
  // [13,14,16,15]
];
let masGood = [
  // [ 1, 2, 3, 4],
  // [ 5, 6, 7, 8],
  // [ 9,10,11,12],
  // [13,14,15,16]
];

//
function createMap(b) {
	let arr = [];
	for (let row = 0; row < N; ++row) {
		arr.push([]);
		for (let col = 0; col < N; ++col) {
			arr[row][col] = (N * row + col + 1);
		}
	}
	if (b) {
		arr[N-1][N-2] += 1;
		arr[N-1][N-1] -= 1;
	}
	return arr;
}

mas0 = createMap(1);
masGood = createMap();
// console.log('mas0:', mas0, 'masGood:', masGood);

function swap(a1, b1, a2, b2) {
  mas0[a1][b1] = [mas0[a2][b2], mas0[a2][b2] = mas0[a1][b1]][0];
}
let tempRnd;
function randomMap() {
  for (let a = 0; a < 10000; a++) {
    tempRnd = getRandomInRange(1, 4);
    for (let i in mas0) {
      for (let j in mas0[i]) {

        if (tempRnd == 1) {
          if (mas0[i][j] == Z) {
            if (j > 0) swap(i,j,i,j-1);
          }
        }
        if (tempRnd == 2) {
          if (mas0[i][j] == Z) {
            if (j < 3) swap(i,j,i,parseInt(j)+1);
          }
        }
        if (tempRnd == 3) {
          if (mas0[i][j] == Z) {
            if (i > 0) swap(i,j,i-1,j);
          }
        }
        if (tempRnd == 4) {
          if (mas0[i][j] == Z) {
            if (i < 3) swap(i,j,parseInt(i)+1,j);
          }
        }
      }
    }
  }
}
randomMap();

let str = '';
let mas = [];
mas = mas0;

$('.start-btn').click(function() {
  // console.log('--- start-btn ---');
  $('.info1').css({'display':'block'});
  play = 1;
  $('.start-field').fadeOut(0);
  init();
  animate();
})

$('.reset-btn').click(function() {
  // console.log('--- reset-btn ---');
  $('.info1').css({'display':'block'});
  // mas0 = [
    // [ 1, 2, 3, 4],
    // [ 5, 6, 7, 8],
    // [ 9,10,11,12],
    // [13,14,16,15]
  // ];
  mas0 = createMap(1);
  mas = mas0;
  randomMap();
  play = 1;
  $('.end-field').fadeOut(1000);
  init();
  animate();
  clock.start();
})

$('.diff-form label').click(function() {
  difficulty = $(this).text() 
})
$('.diff-form2 label').click(function() {
  colorBlock = $(this).text()
})

function init() {
  if (colorBlock == 'wood') loadTexture(1);
  else loadTexture(2);

  let cameraZ;
  if (screen.width < 700) cameraZ = 250;
  else cameraZ = 220;
  
  cameraZ = 375;
  
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.set(-1,-100,cameraZ);
  // camera.position.set(0,0,cameraZ);
  camera.lookAt(0,0,0);
  scene = new THREE.Scene();
  
  // var axes = new THREE.AxesHelper(500); scene.add(axes);

  scene.background = new THREE.Color( 0xf0f0f0 );
  // scene.fog = new THREE.Fog( 0xcce0ff, 50, 700 );
  scene.fog = new THREE.Fog( 0xcce0ff, cameraZ - 100, 700 );
  
	let light = new THREE.DirectionalLight( 0xdfebff, 0.7 );
	light.position.set( 0, 0, 100 );
	light.position.multiplyScalar( 1.3 );
	light.castShadow = true;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	let d = 300;
	light.shadow.camera.left = - d;
	light.shadow.camera.right = d;
	light.shadow.camera.top = d;
	light.shadow.camera.bottom = - d;
	light.shadow.camera.far = 1000;
	scene.add( light );
  
  if (difficulty == 'easy'){ clearBlock = 0; }
  else if (difficulty == 'hard') { clearBlock = 1; }
  
  let ambient = new THREE.AmbientLight( 0xffffff, 0.2 );
  scene.add( ambient );
  
  let floorGeometry = new THREE.BoxGeometry(floorWidth*7,floorHeight*7,5);
  let floorTexture = new THREE.TextureLoader().load( "assets1/floor21.jpg" );
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set( 25, 25 );
  floorTexture.anisotropy = 16;
  floorTexture.repeat.set( 20, 20 );

  let floorMaterial = new THREE.MeshPhongMaterial( { map: floorTexture } );
  let floor = new THREE.Mesh( floorGeometry, floorMaterial );
  floor.position.z = -2.5;
  floor.receiveShadow = true;
  scene.add( floor )
  
  let drawBlock = (i,j,x,y,p,material) => {
    let geometry = new THREE.BoxGeometry( blockSize-0.2,blockSize-0.2,blockSize );
    let block = new THREE.Mesh( geometry, material );
    block.position.set(x,y,blockSize/2);
    block.p = p;
    block.i = i;
    block.j = j;
    mas[i][j] = block;
    scene.add( block );
  }
  
	// renderer = new THREE.WebGLRenderer( { antialias: true } );
	// var dynamicTexture	= new THREEx.DynamicTexture(512,512);
	// dynamicTexture.context.font	= "bolder 90px Verdana";
	// dynamicTexture.texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
	// dynamicTexture.clear('cyan').drawText("Ohayou Sekai", undefined, 256, 'red');
  
  //
	// var text = "Ohayou Sekai";
	// var bitmap = document.createElement('canvas');
	// bitmap.width = 100; bitmap.height = 100;
	// var g = bitmap.getContext('2d');
	// g.font = 'Bold 20px Arial';
	// g.fillStyle = 'white';
	// g.fillText(text, 0, 20);
	// g.strokeStyle = 'black';
	// g.strokeText(text, 0, 20);
	// var texture = new THREE.Texture(bitmap) 
	// texture.needsUpdate = true;
  //
  
  let currentTexture;
  let drawMap = ()=>{
    for(let i in mas) {
      for(let j in mas[i]) {

        if (mas[i][j] != Z) {
		  let blockID = (mas[i][j]-1) % 32;
          currentTexture = textureNumbers[blockID]; // OD
		  
          let materialBlock = new THREE.MeshPhongMaterial( { map:currentTexture } );
          // let materialBlock = new THREE.MeshBasicMaterial( { map:dynamicTexture } );
          drawBlock(i,j,leftFloor + blockSize*j, topFloor - blockSize*i, mas[i][j], materialBlock);
          if (clearBlock == 1) { mas[i][j].material.map.repeat.x = 0; }
          else mas[i][j].material.map.repeat.x = 1;
		  
		  mas[i][j].blockID = blockID;
          //console.log(mas[i][j].p);
        }
        if (mas[i][j] == Z) {
          // currentTexture = textureNumbers[mas[i][j]-1];
          let materialBlock = new THREE.MeshPhongMaterial( { color: 0xff0000, transparent: true, opacity: 0 } );
          drawBlock(i,j,leftFloor + blockSize*j, topFloor - blockSize*i, mas[i][j], materialBlock);
          //console.log(scene);
        }

      }
    }
  }
  drawMap();
  
  
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.gammaInput = true;
  document.querySelector('.field').appendChild( renderer.domElement );
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  window.addEventListener( 'resize', onWindowResize, false );
  
  /*stats = new Stats();
  document.querySelector('.field').appendChild( stats.dom );*/
  
  //////////////////////////////////////////////////////////
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}


function showClearBlock(obj) {
  if (clearBlock == 1 && obj.p != Z) {
    obj.material.map.repeat.x = 1;
    setTimeout(function() {
      obj.material.map.repeat.x = 0;
    },400)
  }
}

let prev_io, TEST = '';
function onDocumentMouseDown( event ) {
  mouse.x =  ( event.clientX / renderer.domElement.clientWidth  ) * 2 - 1;
  mouse.y = -( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
  
  raycaster.setFromCamera( mouse, camera );
  let intersects = raycaster.intersectObjects( [].concat(...mas) );
  
  if (play == 1 && intersects.length > 0 && moveDown == 0 && moveUp == 0 && moveLeft == 0 && moveRight == 0) {
	  
	// if (prev_io) prev_io.material.color.setHex( 0xffffff );
	let io = intersects[0].object;
	if (io.marked) return;
	// io.material.color.setHex( 0xff0000 ); prev_io = io; // OD
	
	let blockID = (io.blockID + 1) % 32;
	io.material.map = textureNumbers[blockID];
	io.blockID = blockID;
	
	check_tile(io)
    
    let posInMasY = io.i;
    let posInMasX = io.j;
	// TEST = 'R' + posInMasY + ':C' + posInMasX; console.log(TEST);

    if (posInMasY < (N-1) && mas[parseInt(posInMasY)+1][posInMasX].p == Z) {
      showClearBlock(intersects[0].object)
      let posY = intersects[0].object.position.y;
      let posYempty = mas[parseInt(posInMasY)+1][posInMasX].position.y;
      
      obj1 = intersects[0];
      obj2 = posYempty;
      moveDown = 1;

      mas[parseInt(posInMasY)+1][posInMasX].position.y = posY;
      
      let tempI1 = mas[parseInt(posInMasY)][posInMasX].i;
      let tempI2 = mas[parseInt(posInMasY)+1][posInMasX].i
      mas[parseInt(posInMasY)][posInMasX].i = tempI2;
      mas[parseInt(posInMasY)+1][posInMasX].i = tempI1;
      
     [mas[parseInt(posInMasY)][posInMasX], mas[parseInt(posInMasY)+1][posInMasX]] 
      = [mas[parseInt(posInMasY)+1][posInMasX], mas[parseInt(posInMasY)][posInMasX]];
    }
    
    else if (posInMasY > 0 && mas[parseInt(posInMasY)-1][posInMasX].p == Z) {
      showClearBlock(intersects[0].object)
      let posY = intersects[0].object.position.y;
      let posYempty = mas[parseInt(posInMasY)-1][posInMasX].position.y;
      
      obj1 = intersects[0];
      obj2 = posYempty;
      moveUp = 1;
      
      mas[parseInt(posInMasY)-1][posInMasX].position.y = posY;
      
      let tempI1 = mas[parseInt(posInMasY)][posInMasX].i;
      let tempI2 = mas[parseInt(posInMasY)-1][posInMasX].i
      mas[parseInt(posInMasY)][posInMasX].i = tempI2;
      mas[parseInt(posInMasY)-1][posInMasX].i = tempI1;
      
      [mas[parseInt(posInMasY)][posInMasX], mas[parseInt(posInMasY)-1][posInMasX]] 
       = [mas[parseInt(posInMasY)-1][posInMasX], mas[parseInt(posInMasY)][posInMasX]];
      
    }
	
    else if (posInMasX < (N-1) && mas[posInMasY][parseInt(posInMasX)+1].p == Z) {
      showClearBlock(intersects[0].object)
      let posX = intersects[0].object.position.x;
      let posXempty = mas[posInMasY][parseInt(posInMasX)+1].position.x;
      
      obj1 = intersects[0];
      obj2 = posXempty;
      moveRight = 1;
      
      mas[posInMasY][parseInt(posInMasX)+1].position.x = posX;
      
      let tempI1 = mas[parseInt(posInMasY)][posInMasX].j;
      let tempI2 = mas[posInMasY][parseInt(posInMasX)+1].j;
      mas[parseInt(posInMasY)][posInMasX].j = tempI2;
      mas[posInMasY][parseInt(posInMasX)+1].j = tempI1;
      
     [mas[parseInt(posInMasY)][posInMasX], mas[posInMasY][parseInt(posInMasX)+1]] 
      = [mas[posInMasY][parseInt(posInMasX)+1], mas[parseInt(posInMasY)][posInMasX]];
    }
    
    else if (posInMasX > 0 && mas[posInMasY][parseInt(posInMasX)-1].p == Z) {
      showClearBlock(intersects[0].object)
      let posX = intersects[0].object.position.x;
      let posXempty = mas[posInMasY][parseInt(posInMasX)-1].position.x;
      
      obj1 = intersects[0];
      obj2 = posXempty;
      moveLeft = 1;
      
      mas[posInMasY][parseInt(posInMasX)-1].position.x = posX;
      
      let tempI1 = mas[parseInt(posInMasY)][posInMasX].j;
      let tempI2 = mas[posInMasY][parseInt(posInMasX)-1].j;
      mas[parseInt(posInMasY)][posInMasX].j = tempI2;
      mas[posInMasY][parseInt(posInMasX)-1].j = tempI1;
      
     [mas[parseInt(posInMasY)][posInMasX], mas[posInMasY][parseInt(posInMasX)-1]] 
      = [mas[posInMasY][parseInt(posInMasX)-1], mas[parseInt(posInMasY)][posInMasX]];
    }
   win();
  }
}

function moveFunc() {
  if (obj1 && obj2) {
    var dy = obj1.object.position.y - obj2;
    var dx = obj1.object.position.x - obj2;
  }
  
  if (moveDown == 1 && obj1.object.position.y > obj2) {
    obj1.object.position.y -= Math.min( 2, dy );
    if (obj1.object.rotation.x < 1.57) {
      obj1.object.rotation.x += 0.065;  
    }
    
  }
  else if (moveDown == 1 && obj1.object.position.y == obj2) {
    moveDown = 0;
    obj1.object.rotation.x = 0;
  }
  
  if (moveUp == 1 && obj1.object.position.y < obj2) {
    obj1.object.position.y += Math.min( 2, -dy );
    if (obj1.object.rotation.x > -1.57) {
      obj1.object.rotation.x -= 0.065;  
    }
  }
  else if (moveUp == 1 && obj1.object.position.y == obj2) {
    moveUp = 0;
    obj1.object.rotation.x = 0;
  }
  
  if (moveRight == 1 && obj1.object.position.x < obj2) {
    obj1.object.position.x += Math.min( 2, -dx );
    if (obj1.object.rotation.y < 1.57) {
      obj1.object.rotation.y += 0.065;  
    }
  }
  else if (moveRight == 1 && obj1.object.position.x == obj2) {
    moveRight = 0;
    obj1.object.rotation.y = 0;
  }
  
  if (moveLeft == 1 && obj1.object.position.x > obj2) {
    obj1.object.position.x -= Math.min( 2, dx );
    if (obj1.object.rotation.y > -1.57) {
      obj1.object.rotation.y -= 0.065;  
    }
  }
  else if (moveLeft == 1 && obj1.object.position.x == obj2) {
    moveLeft = 0;
    obj1.object.rotation.y = 0;
  }
}

function win() {
  // console.log('...win...');
  str = '';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      str += mas[i][j].p
    }
  }
  
  // console.log([].concat(...masGood).join(''), ':', str);
  
  if ([].concat(...masGood).join('') === str) { // OD
  // if ([].concat(...masGood).join('') !== str) {

    $('.info1').css({'display':'none'});
    
    if (difficulty == 'easy' && localStorage["easy"] > time || difficulty == 'easy' && !localStorage["easy"]) {
      localStorage["easy"] = time;
    }
    else if (difficulty == 'hard' && localStorage["hard"] > time || difficulty == 'hard' && !localStorage["hard"]){
      localStorage["hard"] = time;
    }
    
    if (localStorage["easy"]) $('.easy-time .num').text(localStorage["easy"]);
    else $('.easy-time .num').text('-');
    if (localStorage["hard"]) $('.hard-time .num').text(localStorage["hard"]);
    else $('.hard-time .num').text('-');
    
    clock.stop();
	
    $('.win-time .num').text(time);
    $('.name-diff').text("(" + difficulty + ") ");
	
    setTimeout(function() {
      play = 0;
      $('.end-field').fadeIn(500);
      $('.end-field').css({'display':'flex'});
      document.querySelector('.field').removeChild( renderer.domElement );
    }, 300)
    
  } // if
} // win

function animate() {
  if (play == 1) {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    /*stats.update();*/

    time = Math.floor(clock.getElapsedTime());
    $('.info1').text(time);
    moveFunc();
  }
}

const az = "абвгдежзийклмнопрстуфхцчшщъыьэюя";
function get_char(row, col) {
	return az.charAt((mas[row][col]).blockID);
}

function mark(row, col) {
	mas[row][col].marked = true;
	mas[row][col].material.color.setHex( 0xff0000 );
}

function check_tile(o) {
	// let c = "абвгдежзийклмнопрстуфхцчшщъыьэюя".charAt(o.blockID);
	// console.log(`=> ${o.i} : ${o.j} : ${o.blockID} : ${c}`);
	//
	let row = o.i, col = o.j;
	for (let c0 = 0; c0 <= col; ++c0) {
		for (let c1 = col; c1 < N; ++c1) {
			let s = '';
			for (let j = c0; j <= c1; ++j) {
				// s += this.get_tile(row, j).L;
				s += get_char(row, j);
			}
			s = s.toLowerCase();
			if (list_of_lists[s.length].find(it => it === s)) {
				console.log('!', s);
				for (let j = c0; j <= c1; ++j) {
					// this.get_tile(row, j).mark();
					mark(row, j);
				}
			}
		}
	}
	for (let r0 = 0; r0 <= row; ++r0) {
		for (let r1 = row; r1 < N; ++r1) {
			let s = '';
			for (let i = r0; i <= r1; ++i) {
				// s += this.get_tile(i, col).L;
				s += get_char(i, col);
			}
			s = s.toLowerCase();
			if (list_of_lists[s.length].find(it => it === s)) {
				console.log('!', s);
				for (let i = r0; i <= r1; ++i) {
					// this.get_tile(i, col).mark();
					mark(i, col);
				}
			}
		}
	}
	//
}













