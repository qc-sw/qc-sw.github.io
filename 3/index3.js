var canvas = document.getElementById('webgl');
canvas.width = 600;
canvas.height = 600;

// 顶点着色器 绘制内层立方体
var SOLID_VSHADER_SOURCE =
    "attribute vec4 a_Position;\n" +
    "attribute vec4 a_Normal;\n" +
    "attribute vec2 a_TexCoord;\n" +
    "uniform mat4 u_MvpMatrix;\n" +
    "uniform mat4 u_NormalMatrix;\n" +
    "varying float v_NdotL;\n" +
    "varying vec2 v_TexCoord;\n" +
    "uniform vec3 u_LightDirection;\n" +
    "void main(){\n" +
    "   gl_Position = u_MvpMatrix * a_Position;\n" +
    "   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n" +
    "   v_NdotL = max(dot(normal, u_LightDirection), 0.0);\n" +
    "   v_TexCoord = a_TexCoord;\n" +
    "}\n";

// 片元着色器 绘制内层立方体
var SOLID_FSHADER_SOURCE =
    "#ifdef GL_ES\n" +
    "precision mediump float;\n" +
    "#endif\n" +
    "uniform sampler2D u_Sampler;\n" +
    "varying vec2 v_TexCoord;\n" +
    "varying float v_NdotL;\n" +
    "void main(){\n" +
    "   vec4 color = texture2D(u_Sampler, v_TexCoord);\n" +
    "   gl_FragColor = vec4(color.rgb * v_NdotL, color.a);\n" +
    "}\n";

// 顶点着色器 绘制天空盒立方体
var TEXTURE_VSHADER_SOURCE =
    "attribute vec4 a_Position;\n" +
    "attribute vec4 a_Normal;\n" +
    "attribute vec2 a_TexCoord;\n" +
    "uniform mat4 u_MvpMatrix;\n" +
    "uniform mat4 u_NormalMatrix;\n" +
    "varying float v_NdotL;\n" +
    "varying vec2 v_TexCoord;\n" +
    "void main(){\n" +
    "   vec3 lightDirection = vec3(0.0, 0.0, 1.0);\n" +
    "   gl_Position = u_MvpMatrix * a_Position;\n" +
    "   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n" +
    "   v_NdotL = max(dot(normal, lightDirection), 0.0);\n" +
    "   v_TexCoord = a_TexCoord;\n" +
    "}\n";

// 片元着色器 绘制天空盒立方体
var TEXTURE_FSHADER_SOURCE =
    "#ifdef GL_ES\n" +
    "precision mediump float;\n" +
    "#endif\n" +
    "uniform sampler2D u_Sampler;\n" +
    "varying vec2 v_TexCoord;\n" +
    "varying float v_NdotL;\n" +
    "void main(){\n" +
    "   gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n" +
    "}\n";

// 主函数
var drawTick;
var g_eyeX = -4.0, g_eyeY = -3.0, g_eyeZ = 17.0; // Eye position
var g_atX = 0.0, g_atY = 0.0, g_atZ = 0.0;
var flag = 0;
function main() {
    // 获取WebGL绘图上下文
    var gl = getWebGLContext(canvas);
    if(!gl) {
        console.log('获取WebGL上下文失败');
        return;
    }

    // 初始化两个程序着色器
    var solidProgram = createProgram(gl,SOLID_VSHADER_SOURCE, SOLID_FSHADER_SOURCE); // 内层立方体
    var textureProgram = createProgram(gl,TEXTURE_VSHADER_SOURCE,TEXTURE_FSHADER_SOURCE); // 天空盒立方体
    if(!solidProgram || !textureProgram) {
        console.log('创建程序对象失败');
        return;
    }

    // 获取绘制内层立方体着色器的变量位置
    solidProgram.a_Position = gl.getAttribLocation(solidProgram, "a_Position");
    solidProgram.a_Normal = gl.getAttribLocation(solidProgram, "a_Normal");
    solidProgram.a_TexCoord = gl.getAttribLocation(solidProgram, "a_TexCoord");
    solidProgram.u_MvpMatrix = gl.getUniformLocation(solidProgram, "u_MvpMatrix");
    solidProgram.u_NormalMatrix = gl.getUniformLocation(solidProgram, "u_NormalMatrix");
    solidProgram.u_Sampler = gl.getUniformLocation(solidProgram, "u_Sampler");
    solidProgram.u_LightDirection = gl.getUniformLocation(solidProgram, "u_LightDirection");
    if(solidProgram.a_Position < 0 || solidProgram.a_Normal < 0 || solidProgram.a_TexCoord < 0 || !solidProgram.u_MvpMatrix || !solidProgram.u_NormalMatrix || !solidProgram.u_Sampler || !solidProgram.u_LightDirection) {
        console.log('获取内层立方体相关变量存储位置失败');
        return;
    }

    // 获取绘制天空盒立方体着色器的变量位置
    textureProgram.a_Position = gl.getAttribLocation(textureProgram, "a_Position");
    textureProgram.a_Normal = gl.getAttribLocation(textureProgram, "a_Normal");
    textureProgram.a_TexCoord = gl.getAttribLocation(textureProgram, "a_TexCoord");
    textureProgram.u_MvpMatrix = gl.getUniformLocation(textureProgram, "u_MvpMatrix");
    textureProgram.u_NormalMatrix = gl.getUniformLocation(textureProgram, "u_NormalMatrix");
    textureProgram.u_Sampler = gl.getUniformLocation(textureProgram, "u_Sampler");

    if(textureProgram.a_Position < 0 || textureProgram.a_Normal < 0 || textureProgram.a_TexCoord < 0 || !textureProgram.u_MvpMatrix || !textureProgram.u_NormalMatrix || !textureProgram.u_Sampler) {
        console.log('获取天空盒立方体相关变量存储位置失败');
        return;
    }

    // 设置内层立方体顶点信息 存入缓冲区
    var cube = initVertexBuffers(gl);

    // 设置天空盒立方体的纹理数据 存入缓冲区
    var texture = initTextures(gl, textureProgram);
    if(!texture) {
        console.log('无法获取到纹理');
        return;
    }

    //开启隐藏面消除功能，并设置背景色
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // 开始绘制立方体
    var currentAngle = 0.0; // 当前立方体的角度
    // Start drawing

    //设置一个定时绘制的函数
    drawTick = function tick() {  
        // 计算视图投影矩阵
        var viewProjectMatrix = new Matrix4();
        viewProjectMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
        viewProjectMatrix.lookAt(g_eyeX, g_eyeY, g_eyeZ, g_atX, g_atY, g_atZ, 0, 1, 0);

        if(flag != 0) {
            currentAngle = animate(currentAngle); // 更新角度
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // 绘制内层立方体
        drawSolidCube(gl, solidProgram, cube, 0.0, currentAngle, viewProjectMatrix);
        // 绘制天空盒立方体
        drawTexCube(gl, textureProgram, cube, texture, 0.0, currentAngle, viewProjectMatrix);
    
        requestAnimationFrame(tick);
    };
    drawTick();
}

function drawTexCube(gl, program, obj, texture, x, angle, viewProjectMatrix) {
    gl.useProgram(program);

    // 分配缓存对象并开启赋值
    initAttributeVariable(gl, program.a_Position, obj.vertexBuffer); //顶点坐标
    initAttributeVariable(gl, program.a_Normal, obj.normalBuffer); //法向量
    initAttributeVariable(gl, program.a_TexCoord, obj.texCoordBuffer); //纹理坐标
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);

    //设置好纹理对象，开启使用0号的纹理
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //绘制立方体
    drawCube(gl, program, obj, x, angle, viewProjectMatrix)
}

var lightX = -0.5, lightY = -0.5, lightZ = 1.0;

function drawSolidCube(gl, program, obj, x, angle, viewProjectMatrix) {
    gl.useProgram(program);

    //分配缓冲区对象并启用赋值
    initAttributeVariable(gl, program.a_Position, obj.vertexBuffer); //顶点坐标
    initAttributeVariable(gl, program.a_Normal, obj.normalBuffer); //法向量
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer); //绑定索引

    var lightDirection = new Vector3([lightX, lightY, lightZ]);
    lightDirection.normalize();     // Normalize
    gl.uniform3fv(program.u_LightDirection, lightDirection.elements);

    //绘制立方体
    drawLittleCube(gl, program, obj, x, angle, viewProjectMatrix);
}

// 声明绘制需要变换矩阵变量
var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();

function drawCube(gl, program, obj, x, angle, viewProjectMatrix) {
    // 计算模型矩阵
    g_modelMatrix.setTranslate(x, 0.0, 0.0);
    g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);

    // 计算出法向量的方向 并赋值
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

    // 计算视图模型投影矩阵
    g_mvpMatrix.set(viewProjectMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

    gl.drawElements(gl.TRIANGLES, obj.numIndices, obj.indexBuffer.type, 0);
}


// 声明绘制需要变换矩阵变量
var gl_modelMatrix = new Matrix4();
var gl_mvpMatrix = new Matrix4();
var gl_normalMatrix = new Matrix4();
function drawLittleCube(gl, program, obj, x, angle, viewProjectMatrix) {
    // 计算模型矩阵
    gl_modelMatrix.setTranslate(x, 0.0, 0.0);
    gl_modelMatrix.rotate(0.0, 1.0, 0.0, 0.0);
    gl_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);
    gl_modelMatrix.scale(0.05, 0.05, 0.05);

    // 计算出法向量的方向 并赋值
    gl_normalMatrix.setInverseOf(gl_modelMatrix);
    gl_normalMatrix.transpose();
    gl.uniformMatrix4fv(program.u_NormalMatrix, false, gl_normalMatrix.elements);

    // 计算视图模型投影矩阵
    gl_mvpMatrix.set(viewProjectMatrix);
    gl_mvpMatrix.multiply(gl_modelMatrix);
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, gl_mvpMatrix.elements);

    gl.drawElements(gl.TRIANGLES, obj.numIndices, obj.indexBuffer.type, 0);
}

function initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

var angle_step = 30; // 每秒旋转角度
var last = + new Date(); // 保存上次调用animate函数的时间
function animate(angle) {
    var now = +new Date();
    var elapsed = now - last;
    last = now;
    var newAngle = angle + (angle_step * elapsed) / 1000.0;

    return newAngle % 360.0;
}

function initTextures(gl,program) {
    var texture = gl.createTexture();
    if(!texture) {
        console.log('无法创建纹理缓冲区');
        return null;
    }

    var img = new Image();
    img.crossOrigin ='anonymous';
    img.onload = function() {
        // 将图形数据存入纹理对象
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        // 将纹理存入到第一个纹理缓冲区
        gl.useProgram(program);
        gl.uniform1i(program.u_Sampler, 0);

        gl.bindTexture(gl.TEXTURE_2D, null); // 解绑当前
    }

    img.src = 'image/sky2.jpg';

    return texture;
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        20.0, 20.0, 20.0,  -20.0, 20.0, 20.0,  -20.0,-20.0, 20.0,   20.0,-20.0, 20.0,  // v0-v1-v2-v3 front
        20.0, 20.0, 20.0,   20.0,-20.0, 20.0,   20.0,-20.0,-20.0,   20.0, 20.0,-20.0,  // v0-v3-v4-v5 right
        20.0, 20.0, 20.0,   20.0, 20.0,-20.0,  -20.0, 20.0,-20.0,  -20.0, 20.0, 20.0,  // v0-v5-v6-v1 up
        -20.0, 20.0, 20.0,  -20.0, 20.0,-20.0,  -20.0,-20.0,-20.0,  -20.0,-20.0, 20.0,  // v1-v6-v7-v2 left
        -20.0,-20.0,-20.0,   20.0,-20.0,-20.0,   20.0,-20.0, 20.0,  -20.0,-20.0, 20.0,  // v7-v4-v3-v2 down
        20.0,-20.0,-20.0,  -20.0,-20.0,-20.0,  -20.0, 20.0,-20.0,   20.0, 20.0,-20.0,   // v4-v7-v6-v5 back    
    ]);

    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,     // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,     // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0      // v4-v7-v6-v5 back
    ]);

    var texCoords = new Float32Array([
        0.25, 1.0,    0.0, 1.0,    0.0, 0.5,    0.25, 0.5,             
        0.25, 1.0,    0.25, 0.5,    0.5, 0.5,    0.5, 1.0, 
        0.25, 0.0,    0.25, 0.5,    0.0, 0.5,    0.0, 0.0,    
        1.0, 1.0,    0.75, 1.0,    0.75, 0.5,    1.0, 0.5,
        0.25, 0.0,    0.5, 0.0,    0.5, 0.5,    0.25, 0.5,
        0.5, 0.5,    0.75, 0.5,    0.75, 1.0,    0.5, 1.0,
    ]);

    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);

    var obj = {}; // 使用对象返回多个缓冲区对象

    // 将顶点信息写入缓冲区
    obj.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
    obj.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
    obj.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
    obj.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
    if(!obj.vertexBuffer || !obj.normalBuffer || !obj.texCoordBuffer || !obj.indexBuffer){
        return null;
    }

    obj.numIndices = indices.length;

    //取消绑定焦点的数据
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return obj;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
    var buffer = gl.createBuffer();
    if(!buffer) {
        console.log('无法创建缓冲区对象');
        return;
    }

    // 将数据写入缓冲区
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

    buffer.type = type;

    return buffer;
}

function initArrayBufferForLaterUse(gl, data, num, type) {
    var buffer = gl.createBuffer();
    if(!buffer) {
        console.log('无法创建缓冲区对象');
        return;
    }

    // 将数据写入缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // 保留信息
    buffer.num = num;
    buffer.type = type;

    return buffer;
}

var curScale = 1;
document.onkeydown = function(ev){ 
    if(ev.keyCode == 39) { // The right arrow key was pressed
        g_eyeX += 0.1 * curScale;
    } else if (ev.keyCode == 37) { // The left arrow key was pressed
        g_eyeX -= 0.1 * curScale;
    } else if (ev.keyCode == 38) {
        g_eyeY += 0.1 * curScale;
    } else if (ev.keyCode == 40) {
        g_eyeY -= 0.1 * curScale;
    } else if (ev.key == 'd') {
        g_atX += 0.1 * curScale;
    } else if (ev.key == 'a') {
        g_atX -= 0.1 * curScale;
    } else if (ev.key == 'w') {
        g_atY += 0.1 * curScale;
    } else if (ev.key == 's') {
        g_atY -= 0.1 * curScale;
    } else if (ev.key == 'q') {
        g_eyeZ -= 0.1 * curScale;
    } else if (ev.key == 'e') {
        g_eyeZ += 0.1 * curScale;
    } else if (ev.key == 'j') {
        lightX += 0.2;
    } else if (ev.key == 'k') {
        lightY += 0.2;
    } else if (ev.key == 'l') {
        lightZ += 0.2;
    } else if (ev.key == 'u') {
        lightX -= 0.2;
    } else if (ev.key == 'i') {
        lightY -= 0.2;
    } else if (ev.key == 'o') {
        lightZ -= 0.2;
    }else { return; }
    
    drawTick() 
};

function forward() {
    g_eyeZ -= 0.1;
    drawTick();
}
function back() {
    g_eyeZ += 0.1;
    drawTick();  
}
function left() {
    g_atX += 0.1;
    drawTick();
}
function right() {
    g_atX -= 0.1;
    drawTick();
}
function down() {
    g_atY -= 0.1;
    drawTick();
}
function up() {
    g_atY += 0.1;
    drawTick();
}
function rotate() {
    flag = !flag;
    drawTick();
}