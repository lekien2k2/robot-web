var ROS2D = ROS2D || { REVISION: "0.9.0" };
(createjs.Stage.prototype.globalToRos = function (t, e) {
  (t = (t - this.x) / this.scaleX), (e = (this.y - e) / this.scaleY);
  return new ROSLIB.Vector3({ x: t, y: e });
}),
  (createjs.Stage.prototype.rosToGlobal = function (t) {
    return { x: t.x * this.scaleX + this.x, y: t.y * this.scaleY + this.y };
  }),
  (createjs.Stage.prototype.rosQuaternionToGlobalTheta = function (t) {
    var e = t.w,
      i = t.x,
      s = t.y,
      t = t.z;
    return (
      (180 * -Math.atan2(2 * (e * t + i * s), 1 - 2 * (s * s + t * t))) /
      Math.PI
    );
  }),
  (ROS2D.ImageMap = function (t) {
    var e = (t = t || {}).message,
      t = t.image;
    (this.pose = new ROSLIB.Pose({
      position: e.origin.position,
      orientation: e.origin.orientation,
    })),
      (this.width = e.width),
      (this.height = e.height),
      createjs.Bitmap.call(this, t),
      (this.y = -this.height * e.resolution),
      (this.scaleX = e.resolution),
      (this.scaleY = e.resolution),
      (this.width *= this.scaleX),
      (this.height *= this.scaleY),
      (this.x += this.pose.position.x),
      (this.y -= this.pose.position.y);
  }),
  (ROS2D.ImageMap.prototype.__proto__ = createjs.Bitmap.prototype),
  (ROS2D.ImageMapClient = function (t) {
    var e = this,
      i = (t = t || {}).ros,
      s = t.topic || "/map_metadata";
    (this.image = t.image),
      (this.rootObject = t.rootObject || new createjs.Container()),
      (this.currentImage = new createjs.Shape());
    var o = new ROSLIB.Topic({
      ros: i,
      name: s,
      messageType: "nav_msgs/MapMetaData",
    });
    o.subscribe(function (t) {
      o.unsubscribe(),
        (e.currentImage = new ROS2D.ImageMap({ message: t, image: e.image })),
        e.rootObject.addChild(e.currentImage),
        e.rootObject.addChild(new ROS2D.Grid({ size: 1 })),
        e.emit("change");
    });
  }),
  (ROS2D.ImageMapClient.prototype.__proto__ = EventEmitter2.prototype),
  (ROS2D.OccupancyGrid = function (t) {
    var e = (t = t || {}).message,
      i = document.createElement("canvas"),
      t = i.getContext("2d");
    (this.pose = new ROSLIB.Pose({
      position: e.info.origin.position,
      orientation: e.info.origin.orientation,
    })),
      (this.width = e.info.width),
      (this.height = e.info.height),
      (i.width = this.width),
      (i.height = this.height);
    for (
      var s = t.createImageData(this.width, this.height), o = 0;
      o < this.height;
      o++
    )
      for (var n = 0; n < this.width; n++) {
        var r = n + (this.height - o - 1) * this.width,
          a = e.data[r],
          r = 100 === a ? 0 : 0 === a ? 255 : 127,
          a = 4 * (n + o * this.width);
        (s.data[a] = r),
          (s.data[++a] = r),
          (s.data[++a] = r),
          (s.data[++a] = 255);
      }
    t.putImageData(s, 0, 0),
      createjs.Bitmap.call(this, i),
      (this.y = -this.height * e.info.resolution),
      (this.scaleX = e.info.resolution),
      (this.scaleY = e.info.resolution),
      (this.width *= this.scaleX),
      (this.height *= this.scaleY),
      (this.x += this.pose.position.x),
      (this.y -= this.pose.position.y);
  }),
  (ROS2D.OccupancyGrid.prototype.__proto__ = createjs.Bitmap.prototype),
  (ROS2D.OccupancyGridClient = function (t) {
    var i = this,
      e = (t = t || {}).ros,
      s = t.topic || "/map";
    (this.continuous = t.continuous),
      (this.rootObject = t.rootObject || new createjs.Container()),
      (this.currentGrid = new createjs.Shape()),
      this.rootObject.addChild(this.currentGrid),
      this.rootObject.addChild(new ROS2D.Grid({ size: 1 }));
    var o = new ROSLIB.Topic({
      ros: e,
      name: s,
      messageType: "nav_msgs/OccupancyGrid",
      compression: "",
    });
    o.subscribe(function (t) {
      var e = null;
      i.currentGrid &&
        ((e = i.rootObject.getChildIndex(i.currentGrid)),
        i.rootObject.removeChild(i.currentGrid)),
        (i.currentGrid = new ROS2D.OccupancyGrid({ message: t })),
        null !== e
          ? i.rootObject.addChildAt(i.currentGrid, e)
          : i.rootObject.addChild(i.currentGrid),
        i.emit("change"),
        i.continuous || o.unsubscribe();
    });
  }),
  (ROS2D.OccupancyGridClient.prototype.__proto__ = EventEmitter2.prototype),
  (ROS2D.OccupancyGridSrvClient = function (t) {
    var e = this,
      i = (t = t || {}).ros,
      s = t.service || "/static_map";
    (this.rootObject = t.rootObject || new createjs.Container()),
      (this.currentGrid = null),
      new ROSLIB.Service({
        ros: i,
        name: s,
        serviceType: "nav_msgs/GetMap",
        compression: "png",
      }).callService(new ROSLIB.ServiceRequest(), function (t) {
        e.currentGrid && e.rootObject.removeChild(e.currentGrid),
          (e.currentGrid = new ROS2D.OccupancyGrid({ message: t.map })),
          e.rootObject.addChild(e.currentGrid),
          e.emit("change", e.currentGrid);
      });
  }),
  (ROS2D.OccupancyGridSrvClient.prototype.__proto__ = EventEmitter2.prototype),
  (ROS2D.ArrowShape = function (t) {
    var e,
      i,
      s = this,
      o = (t = t || {}).size || 10,
      n = t.strokeSize || 3,
      r = t.strokeColor || createjs.Graphics.getRGB(0, 0, 0),
      a = t.fillColor || createjs.Graphics.getRGB(255, 0, 0),
      h = t.pulse,
      c = new createjs.Graphics(),
      p = o / 3,
      t = (2 * p) / 3;
    c.setStrokeStyle(n),
      c.beginStroke(r),
      c.moveTo(0, 0),
      c.lineTo(o - p, 0),
      c.beginFill(a),
      c.moveTo(o, 0),
      c.lineTo(o - p, t / 2),
      c.lineTo(o - p, -t / 2),
      c.closePath(),
      c.endFill(),
      c.endStroke(),
      createjs.Shape.call(this, c),
      h &&
        ((i = !(e = 0)),
        createjs.Ticker.addEventListener("tick", function () {
          i = i
            ? ((s.scaleX *= 1.035), (s.scaleY *= 1.035), ++e < 10)
            : ((s.scaleX /= 1.035), (s.scaleY /= 1.035), --e < 0);
        }));
  }),
  (ROS2D.ArrowShape.prototype.__proto__ = createjs.Shape.prototype),
  (ROS2D.Grid = function (t) {
    var e = (t = t || {}).size || 10,
      i = t.cellSize || 0.1,
      t = t.lineWidth || 0.001,
      s = new createjs.Graphics();
    s.setStrokeStyle(5 * t),
      s.beginStroke(createjs.Graphics.getRGB(0, 0, 0)),
      s.beginFill(createjs.Graphics.getRGB(255, 0, 0)),
      s.moveTo(-e * i, 0),
      s.lineTo(e * i, 0),
      s.moveTo(0, -e * i),
      s.lineTo(0, e * i),
      s.endFill(),
      s.endStroke(),
      s.setStrokeStyle(t),
      s.beginStroke(createjs.Graphics.getRGB(0, 0, 0)),
      s.beginFill(createjs.Graphics.getRGB(255, 0, 0));
    for (var o = -e; o <= e; o++)
      s.moveTo(-e * i, o * i),
        s.lineTo(e * i, o * i),
        s.moveTo(o * i, -e * i),
        s.lineTo(o * i, e * i);
    s.endFill(), s.endStroke(), createjs.Shape.call(this, s);
  }),
  (ROS2D.Grid.prototype.__proto__ = createjs.Shape.prototype),
  (ROS2D.NavigationArrow = function (t) {
    var e,
      i,
      s = this,
      o = (t = t || {}).size || 10,
      n = t.strokeSize || 3,
      r = t.strokeColor || createjs.Graphics.getRGB(0, 0, 0),
      a = t.fillColor || createjs.Graphics.getRGB(255, 0, 0),
      h = t.pulse,
      t = new createjs.Graphics();
    t.setStrokeStyle(n),
      t.moveTo(-o / 2, -o / 2),
      t.beginStroke(r),
      t.beginFill(a),
      t.lineTo(o, 0),
      t.lineTo(-o / 2, o / 2),
      t.closePath(),
      t.endFill(),
      t.endStroke(),
      createjs.Shape.call(this, t),
      h &&
        ((i = !(e = 0)),
        createjs.Ticker.addEventListener("tick", function () {
          i = i
            ? ((s.scaleX *= 1.035), (s.scaleY *= 1.035), ++e < 10)
            : ((s.scaleX /= 1.035), (s.scaleY /= 1.035), --e < 0);
        }));
  }),
  (ROS2D.NavigationArrow.prototype.__proto__ = createjs.Shape.prototype),
  (ROS2D.NavigationImage = function (t) {
    var s = this,
      o = (t = t || {}).size || 10,
      e = t.image,
      n = t.pulse,
      r = t.alpha || 1,
      a = {},
      h = function (t) {
        return t / c.width;
      },
      c = new Image();
    (c.onload = function () {
      createjs.Bitmap.call(s, c);
      var t,
        e,
        i = h(o);
      (s.alpha = r),
        (s.scaleX = i),
        (s.scaleY = i),
        (s.regY = s.image.height / 2),
        (s.regX = s.image.width / 2),
        (a.rotation = s.rotation),
        Object.defineProperty(s, "rotation", {
          get: function () {
            return a.rotation + 90;
          },
          set: function (t) {
            a.rotation = t;
          },
        }),
        n &&
          ((e = !(t = 0)),
          createjs.Ticker.addEventListener("tick", function () {
            e = e
              ? ((s.scaleX *= 1.02), (s.scaleY *= 1.02), ++t < 10)
              : ((s.scaleX /= 1.02), (s.scaleY /= 1.02), --t < 0);
          }));
    }),
      (c.src = e);
  }),
  (ROS2D.NavigationImage.prototype.__proto__ = createjs.Bitmap.prototype),
  (ROS2D.PathShape = function (t) {
    var e = (t = t || {}).path;
    if (
      ((this.strokeSize = t.strokeSize || 3),
      (this.strokeColor = t.strokeColor || createjs.Graphics.getRGB(0, 0, 0)),
      (this.graphics = new createjs.Graphics()),
      null != e)
    ) {
      this.graphics.setStrokeStyle(this.strokeSize),
        this.graphics.beginStroke(this.strokeColor),
        this.graphics.moveTo(
          e.poses[0].pose.position.x / this.scaleX,
          e.poses[0].pose.position.y / -this.scaleY
        );
      for (var i = 1; i < e.poses.length; ++i)
        this.graphics.lineTo(
          e.poses[i].pose.position.x / this.scaleX,
          e.poses[i].pose.position.y / -this.scaleY
        );
      this.graphics.endStroke();
    }
    createjs.Shape.call(this, this.graphics);
  }),
  (ROS2D.PathShape.prototype.setPath = function (t) {
    if ((this.graphics.clear(), null != t)) {
      this.graphics.setStrokeStyle(this.strokeSize),
        this.graphics.beginStroke(this.strokeColor),
        this.graphics.moveTo(
          t.poses[0].pose.position.x / this.scaleX,
          t.poses[0].pose.position.y / -this.scaleY
        );
      for (var e = 1; e < t.poses.length; ++e)
        this.graphics.lineTo(
          t.poses[e].pose.position.x / this.scaleX,
          t.poses[e].pose.position.y / -this.scaleY
        );
      this.graphics.endStroke();
    }
  }),
  (ROS2D.PathShape.prototype.__proto__ = createjs.Shape.prototype),
  (ROS2D.PolygonMarker = function (t) {
    (this.lineSize = (t = t || {}).lineSize || 3),
      (this.lineColor =
        t.lineColor || createjs.Graphics.getRGB(0, 0, 255, 0.66)),
      (this.pointSize = t.pointSize || 10),
      (this.pointColor =
        t.pointColor || createjs.Graphics.getRGB(255, 0, 0, 0.66)),
      (this.fillColor =
        t.pointColor || createjs.Graphics.getRGB(0, 255, 0, 0.33)),
      (this.lineCallBack = t.lineCallBack),
      (this.pointCallBack = t.pointCallBack),
      (this.pointContainer = new createjs.Container()),
      (this.lineContainer = new createjs.Container()),
      (this.fillShape = new createjs.Shape()),
      createjs.Container.call(this),
      this.addChild(this.fillShape),
      this.addChild(this.lineContainer),
      this.addChild(this.pointContainer);
  }),
  (ROS2D.PolygonMarker.prototype.createLineShape = function (t, e) {
    var i = new createjs.Shape();
    this.editLineShape(i, t, e);
    var s = this;
    return (
      i.addEventListener("mousedown", function (t) {
        null !== s.lineCallBack &&
          void 0 !== s.lineCallBack &&
          s.lineCallBack(
            "mousedown",
            t,
            s.lineContainer.getChildIndex(t.target)
          );
      }),
      i
    );
  }),
  (ROS2D.PolygonMarker.prototype.editLineShape = function (t, e, i) {
    t.graphics.clear(),
      t.graphics.setStrokeStyle(this.lineSize),
      t.graphics.beginStroke(this.lineColor),
      t.graphics.moveTo(e.x, e.y),
      t.graphics.lineTo(i.x, i.y);
  }),
  (ROS2D.PolygonMarker.prototype.createPointShape = function (t) {
    var e = new createjs.Shape();
    e.graphics.beginFill(this.pointColor),
      e.graphics.drawCircle(0, 0, this.pointSize),
      (e.x = t.x),
      (e.y = -t.y);
    var i = this;
    return (
      e.addEventListener("mousedown", function (t) {
        null !== i.pointCallBack &&
          void 0 !== i.pointCallBack &&
          i.pointCallBack(
            "mousedown",
            t,
            i.pointContainer.getChildIndex(t.target)
          );
      }),
      e
    );
  }),
  (ROS2D.PolygonMarker.prototype.addPoint = function (t) {
    var e = this.createPointShape(t);
    this.pointContainer.addChild(e);
    var i = this.pointContainer.getNumChildren();
    i < 2 ||
      (i < 3 &&
        ((t = this.createLineShape(this.pointContainer.getChildAt(i - 2), e)),
        this.lineContainer.addChild(t))),
      2 < i &&
        this.editLineShape(
          this.lineContainer.getChildAt(i - 2),
          this.pointContainer.getChildAt(i - 2),
          e
        ),
      1 < i &&
        ((e = this.createLineShape(e, this.pointContainer.getChildAt(0))),
        this.lineContainer.addChild(e)),
      this.drawFill();
  }),
  (ROS2D.PolygonMarker.prototype.remPoint = function (t) {
    var e =
        t instanceof createjs.Shape ? this.pointContainer.getChildIndex(t) : t,
      t = this.pointContainer.getNumChildren();
    t < 2 ||
      (t < 3
        ? this.lineContainer.removeAllChildren()
        : (this.editLineShape(
            this.lineContainer.getChildAt((e - 1 + t) % t),
            this.pointContainer.getChildAt((e - 1 + t) % t),
            this.pointContainer.getChildAt((e + 1) % t)
          ),
          this.lineContainer.removeChildAt(e))),
      this.pointContainer.removeChildAt(e),
      this.drawFill();
  }),
  (ROS2D.PolygonMarker.prototype.movePoint = function (t, e) {
    var i,
      s =
        t instanceof createjs.Shape
          ? ((i = this.pointContainer.getChildIndex(t)), t)
          : this.pointContainer.getChildAt((i = t));
    (s.x = e.x), (s.y = -e.y);
    t = this.pointContainer.getNumChildren();
    1 < t &&
      ((e = this.lineContainer.getChildAt((i - 1 + t) % t)),
      this.editLineShape(e, this.pointContainer.getChildAt((i - 1 + t) % t), s),
      (e = this.lineContainer.getChildAt(i)),
      this.editLineShape(e, s, this.pointContainer.getChildAt((i + 1) % t))),
      this.drawFill();
  }),
  (ROS2D.PolygonMarker.prototype.splitLine = function (t) {
    var e,
      i =
        t instanceof createjs.Shape
          ? ((e = this.lineContainer.getChildIndex(t)), t)
          : this.lineContainer.getChildAt((e = t)),
      s = this.pointContainer.getNumChildren(),
      o = this.pointContainer.getChildAt(e).x,
      n = this.pointContainer.getChildAt(e).y,
      r = this.pointContainer.getChildAt((e + 1) % s).x,
      t = this.pointContainer.getChildAt((e + 1) % s).y,
      t = new ROSLIB.Vector3({ x: (o + r) / 2, y: -((n + t) / 2) }),
      t = this.createPointShape(t);
    this.pointContainer.addChildAt(t, e + 1);
    s = this.createLineShape(t, this.pointContainer.getChildAt((e + 2) % ++s));
    this.lineContainer.addChildAt(s, e + 1),
      this.editLineShape(i, this.pointContainer.getChildAt(e), t),
      this.drawFill();
  }),
  (ROS2D.PolygonMarker.prototype.drawFill = function () {
    var t = this.pointContainer.getNumChildren();
    if (2 < t) {
      var e = this.fillShape.graphics;
      e.clear(),
        e.setStrokeStyle(0),
        e.moveTo(
          this.pointContainer.getChildAt(0).x,
          this.pointContainer.getChildAt(0).y
        ),
        e.beginStroke(),
        e.beginFill(this.fillColor);
      for (var i = 1; i < t; ++i)
        e.lineTo(
          this.pointContainer.getChildAt(i).x,
          this.pointContainer.getChildAt(i).y
        );
      e.closePath(), e.endFill(), e.endStroke();
    } else this.fillShape.graphics.clear();
  }),
  (ROS2D.PolygonMarker.prototype.__proto__ = createjs.Container.prototype),
  (ROS2D.TraceShape = function (t) {
    var e = (t = t || {}).pose;
    (this.strokeSize = t.strokeSize || 3),
      (this.strokeColor = t.strokeColor || createjs.Graphics.getRGB(0, 0, 0)),
      (this.maxPoses = t.maxPoses || 100),
      (this.minDist = t.minDist || 0.05),
      (this.minDist = this.minDist * this.minDist),
      (this.poses = []),
      (this.graphics = new createjs.Graphics()),
      this.graphics.setStrokeStyle(this.strokeSize),
      this.graphics.beginStroke(this.strokeColor),
      null != e && this.poses.push(e),
      createjs.Shape.call(this, this.graphics);
  }),
  (ROS2D.TraceShape.prototype.addPose = function (t) {
    var e,
      i = this.poses.length - 1;
    i < 0
      ? (this.poses.push(t),
        this.graphics.moveTo(
          t.position.x / this.scaleX,
          t.position.y / -this.scaleY
        ))
      : ((e = this.poses[i].position.x),
        (i = this.poses[i].position.y),
        (e = t.position.x - e) * e + (i = t.position.y - i) * i >
          this.minDist &&
          (this.graphics.lineTo(
            t.position.x / this.scaleX,
            t.position.y / -this.scaleY
          ),
          this.poses.push(t))),
      0 < this.maxPoses && this.maxPoses < this.poses.length && this.popFront();
  }),
  (ROS2D.TraceShape.prototype.popFront = function () {
    if (0 < this.poses.length) {
      this.poses.shift(),
        this.graphics.clear(),
        this.graphics.setStrokeStyle(this.strokeSize),
        this.graphics.beginStroke(this.strokeColor),
        this.graphics.lineTo(
          this.poses[0].position.x / this.scaleX,
          this.poses[0].position.y / -this.scaleY
        );
      for (var t = 1; t < this.poses.length; ++t)
        this.graphics.lineTo(
          this.poses[t].position.x / this.scaleX,
          this.poses[t].position.y / -this.scaleY
        );
    }
  }),
  (ROS2D.TraceShape.prototype.__proto__ = createjs.Shape.prototype),
  (ROS2D.PanView = function (t) {
    (this.rootObject = (t = t || {}).rootObject),
      this.rootObject instanceof createjs.Stage
        ? (this.stage = this.rootObject)
        : (this.stage = this.rootObject.getStage()),
      (this.startPos = new ROSLIB.Vector3());
  }),
  (ROS2D.PanView.prototype.startPan = function (t, e) {
    (this.startPos.x = t), (this.startPos.y = e);
  }),
  (ROS2D.PanView.prototype.pan = function (t, e) {
    (this.stage.x += t - this.startPos.x),
      (this.startPos.x = t),
      (this.stage.y += e - this.startPos.y),
      (this.startPos.y = e);
  }),
  (ROS2D.Viewer = function (t) {
    var e = (t = t || {}).divID;
    (this.width = t.width), (this.height = t.height);
    var i = t.background || "#111111",
      t = document.createElement("canvas");
    (t.width = this.width),
      (t.height = this.height),
      (t.style.background = i),
      document.getElementById(e).appendChild(t),
      (this.scene = new createjs.Stage(t)),
      (this.scene.y = this.height),
      document.getElementById(e).appendChild(t),
      createjs.Ticker.setFPS(30),
      createjs.Ticker.addEventListener("tick", this.scene);
  }),
  (ROS2D.Viewer.prototype.addObject = function (t) {
    this.scene.addChild(t);
  }),
  (ROS2D.Viewer.prototype.scaleToDimensions = function (t, e) {
    (this.scene.x =
      void 0 !== this.scene.x_prev_shift
        ? this.scene.x_prev_shift
        : this.scene.x),
      (this.scene.y =
        void 0 !== this.scene.y_prev_shift
          ? this.scene.y_prev_shift
          : this.scene.y),
      (this.scene.scaleX = this.width / t),
      (this.scene.scaleY = this.height / e);
  }),
  (ROS2D.Viewer.prototype.shift = function (t, e) {
    (this.scene.x_prev_shift = this.scene.x),
      (this.scene.y_prev_shift = this.scene.y),
      (this.scene.x -= t * this.scene.scaleX),
      (this.scene.y += e * this.scene.scaleY);
  }),
  (ROS2D.ZoomView = function (t) {
    (this.rootObject = (t = t || {}).rootObject),
      (this.minScale = t.minScale || 0.001),
      this.rootObject instanceof createjs.Stage
        ? (this.stage = this.rootObject)
        : (this.stage = this.rootObject.getStage()),
      (this.center = new ROSLIB.Vector3()),
      (this.startShift = new ROSLIB.Vector3()),
      (this.startScale = new ROSLIB.Vector3());
  }),
  (ROS2D.ZoomView.prototype.startZoom = function (t, e) {
    (this.center.x = t),
      (this.center.y = e),
      (this.startShift.x = this.stage.x),
      (this.startShift.y = this.stage.y),
      (this.startScale.x = this.stage.scaleX),
      (this.startScale.y = this.stage.scaleY);
  }),
  (ROS2D.ZoomView.prototype.zoom = function (t) {
    this.startScale.x * t < this.minScale &&
      (t = this.minScale / this.startScale.x),
      this.startScale.y * t < this.minScale &&
        (t = this.minScale / this.startScale.y),
      (this.stage.scaleX = this.startScale.x * t),
      (this.stage.scaleY = this.startScale.y * t),
      (this.stage.x =
        this.startShift.x -
        (this.center.x - this.startShift.x) *
          (this.stage.scaleX / this.startScale.x - 1)),
      (this.stage.y =
        this.startShift.y -
        (this.center.y - this.startShift.y) *
          (this.stage.scaleY / this.startScale.y - 1));
  });
