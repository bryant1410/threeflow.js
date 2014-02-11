image {
  resolution 800 600
  aa 1 2
  samples 4
  contrast 0.1
  filter mitchell
  jitter true
}

trace-depths {
  diff 2
  refl 4
  refr 4
}

gi {
  type igi
  samples 64
  sets 1
  b 0.01
  bias-samples 0
}

camera {
  type pinhole
  eye 50 20 50
  target -0.38050638109665413 0.7483271805184798 0.26572911994115905
  up 0 1 0
  fov 46.666666666666664
  aspect 1.3333333333333333
}

light {
  type meshlight
  name E7641607-B159-464E-AA40-E2F0BBFACEEE
  emit { "sRGB nonlinear" 1 1 1 }
  radiance 10 
  samples 16 
  points 4
    -5 5 0
    5 5 0
    -5 -5 0
    5 -5 0
  triangles 2
    0 2 1
    2 3 1
}

shader {
  name 12BF2C0B-C014-4819-A534-03A9DFE1CE90
  type diffuse
  diff { "sRGB nonlinear" 1 1 1 }
}

shader {
  name BDD9CA4B-FC06-4614-AE52-76BFC112BF99
  type diffuse
  diff { "sRGB nonlinear" 0 0 1 }
}

object {
  noinstance
  type generic-mesh
  name 8A02299D-388A-4ECF-8FB3-50CB6E86F7F2
  points 42
    -2.628655560595668 4.2532540417602 0
    2.628655560595668 4.2532540417602 0
    -2.628655560595668 -4.2532540417602 0
    2.628655560595668 -4.2532540417602 0
    0 -2.628655560595668 4.2532540417602
    0 2.628655560595668 4.2532540417602
    0 -2.628655560595668 -4.2532540417602
    0 2.628655560595668 -4.2532540417602
    4.2532540417602 0 -2.628655560595668
    4.2532540417602 0 2.628655560595668
    -4.2532540417602 0 -2.628655560595668
    -4.2532540417602 0 2.628655560595668
    -4.045084971874737 2.5 1.545084971874737
    -1.545084971874737 4.045084971874737 2.5
    -2.5 1.545084971874737 4.045084971874737
    0 5 0
    1.545084971874737 4.045084971874737 2.5
    -1.545084971874737 4.045084971874737 -2.5
    1.545084971874737 4.045084971874737 -2.5
    -4.045084971874737 2.5 -1.545084971874737
    -2.5 1.545084971874737 -4.045084971874737
    -5 0 0
    4.045084971874737 2.5 1.545084971874737
    2.5 1.545084971874737 4.045084971874737
    0 0 5
    -2.5 -1.545084971874737 4.045084971874737
    -4.045084971874737 -2.5 1.545084971874737
    -4.045084971874737 -2.5 -1.545084971874737
    -2.5 -1.545084971874737 -4.045084971874737
    0 0 -5
    2.5 1.545084971874737 -4.045084971874737
    4.045084971874737 2.5 -1.545084971874737
    4.045084971874737 -2.5 1.545084971874737
    1.545084971874737 -4.045084971874737 2.5
    2.5 -1.545084971874737 4.045084971874737
    0 -5 0
    -1.545084971874737 -4.045084971874737 2.5
    1.545084971874737 -4.045084971874737 -2.5
    -1.545084971874737 -4.045084971874737 -2.5
    4.045084971874737 -2.5 -1.545084971874737
    2.5 -1.545084971874737 -4.045084971874737
    5 0 0
  triangles 80
    12 13 0
    12 14 13
    11 14 12
    14 5 13
    13 15 0
    13 16 15
    5 16 13
    16 1 15
    15 17 0
    15 18 17
    1 18 15
    18 7 17
    17 19 0
    17 20 19
    7 20 17
    20 10 19
    19 12 0
    19 21 12
    10 21 19
    21 11 12
    16 22 1
    16 23 22
    5 23 16
    23 9 22
    14 24 5
    14 25 24
    11 25 14
    25 4 24
    21 26 11
    21 27 26
    10 27 21
    27 2 26
    20 28 10
    20 29 28
    7 29 20
    29 6 28
    18 30 7
    18 31 30
    1 31 18
    31 8 30
    32 33 3
    32 34 33
    9 34 32
    34 4 33
    33 35 3
    33 36 35
    4 36 33
    36 2 35
    35 37 3
    35 38 37
    2 38 35
    38 6 37
    37 39 3
    37 40 39
    6 40 37
    40 8 39
    39 32 3
    39 41 32
    8 41 39
    41 9 32
    34 24 4
    34 23 24
    9 23 34
    23 5 24
    36 26 2
    36 25 26
    4 25 36
    25 11 26
    38 28 6
    38 27 28
    2 27 38
    27 10 28
    40 30 8
    40 29 30
    6 29 40
    29 7 30
    41 22 9
    41 31 22
    8 31 41
    31 1 22
  normals none
  uvs none
}

object {
  shader 12BF2C0B-C014-4819-A534-03A9DFE1CE90
  type plane
  p 0 0 0
  n 0 1 0
}

instance {
  name 6CADA058-F148-44E3-BE23-360DD8B12413
  geometry 8A02299D-388A-4ECF-8FB3-50CB6E86F7F2
  transform col 1 0 0 0 0 1 0 0 0 0 1 0 0 5 0 1
  shader BDD9CA4B-FC06-4614-AE52-76BFC112BF99
}

