

var cubeRotation = 0.0;
var sphere = {smoothness: 30, size: 1, colors:{random:true, r: 0, g:0, b: 0, a: 1}};
var cylinder = {smoothness: 30, size: 5, colors:{random:true, r: 0, g:0, b: 0, a: 1}};
var fractal = {depth: 5, branches: 2};
var position = [0,-10,-50];
var rotation = [0.0, 1.0, 0];

function setFractalAttributes() {
    fractal = {
        depth: parseInt(document.getElementById("fractalDepth").value),
        branches: parseInt(document.getElementById("fractalBranches").value)
    };
    main();
};
function setSphereAttributes() {
   sphere = {
        smoothness: parseInt(document.getElementById("sphereSmoothness").value),
        size: parseInt(document.getElementById("sphereRadius").value),
        colors:{
            random:true,
            r: parseInt(document.getElementById("sphereR").value),
            g: parseInt(document.getElementById("sphereG").value),
            b: parseInt(document.getElementById("sphereB").value),
            a: 1
        }
    };
   main();
};
function setCylinderAttributes() {
    cylinder = {
        smoothness: parseInt(document.getElementById("cylinderSmoothness").value),
        size: parseInt(document.getElementById("cylinderHeight").value),
        colors:{
            random:true,
            r: parseInt(document.getElementById("cylinderR").value),
            g: parseInt(document.getElementById("cylinderG").value),
            b: parseInt(document.getElementById("cylinderB").value),
            a: 1
        }
    };
    main();
};
function setPosition() {
    position=[
        parseInt(document.getElementById("posX").value),
        parseInt(document.getElementById("posY").value),
        parseInt(document.getElementById("posZ").value),
    ];
    main();
};
function setRotation() {
    rotation=[
        parseInt(document.getElementById("rotX").value),
        parseInt(document.getElementById("rotY").value),
        parseInt(document.getElementById("rotZ").value),
    ];
    main();
};


main();

function main() {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    const vsSource = 'attribute vec4 aVertexPosition;' +
        'attribute vec4 aVertexColor;' +
        'uniform mat4 uModelViewMatrix;' +
        'uniform mat4 uProjectionMatrix;' +
        'varying lowp vec4 vColor;' +
        'void main(void) {' +
        '   gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;' +
        'vColor = aVertexColor;' +
        '}';

    const fsSource = 'varying lowp vec4 vColor; ' +
        'void main(void) {\n' +
        '      gl_FragColor = vColor;\n' +
        '    }';

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    var arrays = {
        sphere : addPositionsColorsSphere(sphere.smoothness,  sphere.size, sphere.colors),
        cylinder : addPositionsCylinder(cylinder.smoothness, cylinder.size, cylinder.colors)
    };

    var buffers = {
        sphere : initBuffers(gl, arrays.sphere),
        cylinder : initBuffers(gl, arrays.cylinder)
    }

    var then = 0;

    function render(now) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        now *= 0.0008;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, deltaTime);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function addPositionsCylinder(segments, height, colors){
    var y = 0;
    var theta = (Math.PI/180) * (360/segments);

    const sidePositions = [];
    const topPositions = [];
    const bottomPositions = [];

    for (var i = 0; i <= segments; i++) {

        var x =  Math.cos(theta*i);
        var z =  Math.sin(theta*i);
        if(colors.random){
            colors.r = (Math.floor(Math.random()*255)+1)/256;
            colors.g = (Math.floor(Math.random()*255)+1)/256;
            colors.b =(Math.floor(Math.random()*255)+1)/256;
            colors.a = 1.0;
        }

        bottomPositions.push(x, y, z, colors.r, colors.g, colors.b, colors.a);
        sidePositions.push(x, y, z, colors.r, colors.g, colors.b, colors.a);
        sidePositions.push(x, y+height, z, colors.r, colors.g, colors.b, colors.a);
        topPositions.push(x, y+height, z, colors.r, colors.g, colors.b, colors.a);
    }

    return {positions:{bottomPositions: bottomPositions, sidePositions: sidePositions, topPositions: topPositions }};
}

function addPositionsColorsSphere(smoothness, radius, colors)
{
    const indices = [];
    const positions =[];

    for(var lat=0; lat <= smoothness; lat++){
        var theta = lat * Math.PI / smoothness;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for(var log =0; log<= smoothness; log++){
            var phi = log *2*Math.PI/smoothness;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            var x=cosPhi*sinTheta;
            var y=cosTheta;
            var z=sinPhi*sinTheta;


            if(colors.random){
                colors.r = (Math.floor(Math.random()*255)+1)/256;
                colors.g = (Math.floor(Math.random()*255)+1)/256;
                colors.b =(Math.floor(Math.random()*255)+1)/256;
                colors.a = 1.0;
            }
            positions.push(x*radius, y*radius, z*radius, colors.r, colors.g, colors.b, colors.a);
        }
    }

    for (var lat=0; lat<smoothness; lat++){
        for(var log=0; log<smoothness; log++){
            var first = (lat*(smoothness+1))+log;
            var second = first + smoothness + 1;
            indices.push(first, second, first+1);
            indices.push(second, second+1, first+1);
        }
    }
    return {positions: positions, indices: indices};

}



function initBuffers(gl, arrays) {

    if( arrays.indices){
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.positions), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrays.indices), gl.STATIC_DRAW);

        return {position: positionBuffer, indices: indexBuffer,numIndices : arrays.indices.length};
    }else{
        const topPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, topPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.positions.topPositions), gl.STATIC_DRAW);

        const bottomPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bottomPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.positions.bottomPositions), gl.STATIC_DRAW);

        const sidePositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sidePositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.positions.sidePositions), gl.STATIC_DRAW);

        return {
            top: {positions: topPositionBuffer, indices: arrays.positions.topPositions.length / 7},
            bottom: {positions:bottomPositionBuffer, indices: arrays.positions.bottomPositions.length / 7},
            side: {positions:sidePositionBuffer, indices: arrays.positions.sidePositions.length / 7}
        };
    }

}

function drawPartCylinder(gl, programInfo, buffers, deltaTime, projectionMatrix, modelViewMatrix) {
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = (3+4)*4;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positions);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition,numComponents,type,normalize,stride,offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = (3+4)*4;
        const offset = 3*4;
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor,numComponents,type,normalize,stride,offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    }

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,false,modelViewMatrix);

    {
        const vertexCount = buffers.indices;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);
    }
}

function drawCylinder(gl, programInfo, buffers, deltaTime, projectionMatrix, modelViewMatrix) {
    drawPartCylinder(gl, programInfo, buffers.side, deltaTime, projectionMatrix, modelViewMatrix);
    drawPartCylinder(gl, programInfo, buffers.top, deltaTime, projectionMatrix, modelViewMatrix);
    drawPartCylinder(gl, programInfo, buffers.bottom, deltaTime, projectionMatrix, modelViewMatrix);

}

function drawSphere(gl, programInfo, buffers, deltaTime, projectionMatrix, modelViewMatrix) {
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = (3+4)*4;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition,numComponents,type,normalize,stride,offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = (3+4)*4;
        const offset = 3*4;
        //const offset = 0;
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor,numComponents,type,normalize,stride,offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,false,projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,false,modelViewMatrix);


    {
        const vertexCount = buffers.numIndices;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}
function translate(split, matrix, vector){
    if(split){
        var newMatrix = mat4.create();
        mat4.copy(newMatrix, matrix);
        mat4.translate(newMatrix,newMatrix, vector);
        return newMatrix;
    }else{
        mat4.translate(matrix, matrix, vector);
        return matrix;
    }
}

function rotate(split, matrix, angle, vector){
    if(split){
        var newMatrix = mat4.create();
        mat4.copy(newMatrix, matrix);
        mat4.rotate(newMatrix,newMatrix, angle,  vector);
        return newMatrix;
    }else{
        mat4.rotate(matrix, matrix, angle, vector);
        return matrix;
    }
}

function scale(split, matrix, vector){
    if(split){
        var newMatrix = mat4.create();
        mat4.copy(newMatrix, matrix);
        mat4.scale(newMatrix,newMatrix, vector);
        return newMatrix;
    }else{
        mat4.scale(matrix, matrix, vector);
        return matrix;
    }
}

function drawBranchTwo(gl, programInfo, buffers, deltaTime, projectionMatrix, modelViewMatrix, depth, branches){
    drawCylinder(gl, programInfo, buffers.cylinder, deltaTime, projectionMatrix, modelViewMatrix);
    //mat4.scale(modelViewMatrix, modelViewMatrix,[0.75,0.75,0.75]);
    //translate(false, modelViewMatrix, modelViewMatrix, [0, 5.25, 0]);
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, cylinder.size+sphere.size/4, 0]);
    if(depth>0) {
        drawSphere(gl, programInfo, buffers.sphere, deltaTime, projectionMatrix, modelViewMatrix);
        translate(false, modelViewMatrix, modelViewMatrix, [0, sphere.size, 0]);
        var rama1 = rotate(true, modelViewMatrix, Math.PI/2,[-1, 1, 1] );
        var rama2 = rotate(true, modelViewMatrix, Math.PI/2,[1, 1, -1] );
        drawTrunk(gl, programInfo, buffers, deltaTime, projectionMatrix, rama1, depth-1, branches);
        drawTrunk(gl, programInfo, buffers, deltaTime, projectionMatrix, rama2, depth-1, branches);
    }
    else{
        drawSphere(gl, programInfo, buffers.sphere, deltaTime, projectionMatrix, modelViewMatrix);
    }
}

function drawBranches(gl, programInfo, buffers, deltaTime, projectionMatrix, modelViewMatrix, depth, branches){
    drawCylinder(gl, programInfo, buffers.cylinder, deltaTime, projectionMatrix, modelViewMatrix);
    mat4.scale(modelViewMatrix, modelViewMatrix,[0.75,0.75,0.75]);
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, buffers.cylinder, 0]);
    if(depth>0) {
        drawSphere(gl, programInfo, buffers.sphere, deltaTime, projectionMatrix, modelViewMatrix);
        mat4.translate(modelViewMatrix, modelViewMatrix, [0, buffers.sphere, 0]);
        for(var i = 0; i<branches; i++){
            var matriz = mat4.create();
            mat4.copy(matriz, modelViewMatrix);

            mat4.rotate(matriz,matriz, Math.PI/branches,[-1+((2/branches)*i), 1, 1-((2/branches)*i)]);
            drawTrunk(gl, programInfo, buffers, deltaTime, projectionMatrix, matriz, depth-1, branches);
        }
    }
    else{
        drawSphere(gl, programInfo, buffers.sphere, deltaTime, projectionMatrix, modelViewMatrix);
    }
}


function drawTrunk(gl, programInfo, buffers, deltaTime, projectionMatrix, modelViewMatrix, depth, branches){
    //drawBranches(gl, programInfo, buffers, deltaTime, projectionMatrix, modelViewMatrix, depth, branches);
    drawBranchTwo(gl, programInfo, buffers, deltaTime, projectionMatrix, modelViewMatrix, depth, branches)
}



function drawScene(gl, programInfo, buffers, deltaTime) {

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,fieldOfView,aspect,zNear, zFar);
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, position);  // amount to translate
    mat4.rotate(modelViewMatrix,  modelViewMatrix,   cubeRotation*.7, rotation);
    drawTrunk(gl, programInfo, buffers, deltaTime, projectionMatrix, modelViewMatrix, fractal.depth, fractal.branches);

    // for(var i=0; i<20; i++){
    //     var matriz = mat4.create();
    //     mat4.copy(matriz, modelViewMatrix)
    //     mat4.translate(matriz, matriz, [i*10,0,i*10]);
    //     drawTrunk(gl, programInfo, buffers, deltaTime, projectionMatrix, matriz, fractal.depth, fractal.branches);
    // }


    cubeRotation += deltaTime;
}


function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}


function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
