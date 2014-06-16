function EditorCameraController() {}
EditorCameraController.prototype =
{
    // public ----------------------------------------------------------------------------

    update : function cameraControllerUpdateFn()
    {
        var updateMatrix = false;

        if (this.turn !== 0.0 ||
            this.pitch !== 0.0)
        {
            updateMatrix = true;

            this.rotate(this.turn, this.pitch);

            this.turn = 0.0;
            this.pitch = 0.0;
        }

        if (this.step > 0)
        {
            this.forward += this.step;
        }
        else if (this.step < 0)
        {
            this.backward -= this.step;
        }

        var right = (this.right - this.left);
        var up = (this.up - this.down);
        var forward = (this.forward - this.backward);

        if (right !== 0.0 ||
            up !== 0.0 ||
            forward !== 0.0)
        {
            updateMatrix = true;

            this.translate(right, up, forward);

            if (this.step > 0)
            {
                this.forward -= this.step;
                this.step = 0.0;
            }
            else if (this.step < 0)
            {
                this.backward += this.step;
                this.step = 0.0;
            }
        }

        if (updateMatrix)
        {
            this.camera.updateViewMatrix();
        }

        // Reset state

        this.left = 0.0;
        this.right = 0.0;
        this.forward = 0.0;
        this.backward = 0.0;
        this.up = 0.0;
        this.down = 0.0;
    },

    moveLeft : function editorcameracontrollerMoveLeftFn(distance)
    {
        this.left += distance;
    },

    moveRight : function editorcameracontrollerMoveRightFn(distance)
    {
        this.right += distance;
    },

    moveForward : function editorcameracontrollerMoveForwardFn(distance)
    {
        this.forward += distance;
    },

    moveBackward : function editorcameracontrollerMoveBackwardFn(distance)
    {
        this.backward += distance;
    },

    moveDown : function editorcameracontrollerMoveDownFn(distance)
    {
        this.up += distance;
    },

    moveUp : function editorcameracontrollerMoveUpFn(distance)
    {
        this.down += distance;
    },

    zoom : function editorcameracontrollerZoomFn(delta)
    {
        this.step = delta;
    },

    look : function editorcameracontrollerLookFn(deltaX, deltaY)
    {
        this.turn  += deltaX;
        this.pitch += deltaY;
    },

    // private ---------------------------------------------------------------------------

    rotateSpeed       : 2.0,
    maxSpeed          : 1,
    mouseRotateFactor : 0.1,

    rotate : function rotateFn(turn, pitch)
    {
        var degreestoradians = (Math.PI / 180.0);
        var md = this.md;
        var matrix = this.camera.matrix;
        var pos = md.m43Pos(matrix);
        md.m43SetPos(matrix, md.v3BuildZero());

        var rotate;

        if (pitch !== 0.0)
        {
            pitch *= this.rotateSpeed * degreestoradians;
            pitch *= this.mouseRotateFactor;

            var right = md.v3Normalize(md.m43Right(matrix));
            md.m43SetRight(matrix, right);

            rotate = md.m43FromAxisRotation(right, pitch);

            matrix = md.m43Mul(matrix, rotate);
        }

        if (turn !== 0.0)
        {
            turn *= this.rotateSpeed * degreestoradians;
            turn *= this.mouseRotateFactor;

            rotate = md.m43FromAxisRotation(md.v3BuildYAxis(), turn);

            matrix = md.m43Mul(matrix, rotate);
        }

        md.m43SetPos(matrix, pos);

        this.camera.matrix = matrix;
    },

    translate : function translateFn(right, up, forward)
    {
        var md = this.md;
        var matrix = this.camera.matrix;
        var pos = md.m43Pos(matrix);
        var speed = this.maxSpeed;
        pos = md.v3Add4(pos,
            md.v3ScalarMul(md.m43Right(matrix), (speed * right)),
            md.v3ScalarMul(md.m43Up(matrix),    (speed * up)),
            md.v3ScalarMul(md.m43At(matrix),   -(speed * forward)));
        md.m43SetPos(matrix, pos);
    }
};

// Constructor function
EditorCameraController.create = function cameraControllerCreateFn(graphicsDevice, camera)
{
    var c = new EditorCameraController();

    c.graphicsDevice = graphicsDevice;
    c.camera = camera;
    c.md = camera.md;

    c.turn = 0.0;
    c.pitch = 0.0;
    c.right = 0.0;
    c.left = 0.0;
    c.up = 0.0;
    c.down = 0.0;
    c.forward = 0.0;
    c.backward = 0.0;
    c.step = 0.0;

    return c;
};