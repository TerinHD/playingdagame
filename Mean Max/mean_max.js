/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

function Reaper() {
    var unitId = -1;
    var playerId = -1;
    var mass = -1;
    var radius = -1;
    var xPos = 0;
    var yPos = 0;
    var xVel = 0;
    var yVel = 0;
}

function Wreck() {
    var unitId = -1;
    var radius = -1;
    var xPos = 0;
    var yPos =0;
    var waterQuantity = -1;
}

function checkInsideRadius( wreck, reaper ) {
    var d2 = Math.pow( reaper.xPos - wreck.xPos, 2 ) + Math.pow( reaper.yPos - wreck.yPos, 2);
    var r2 = Math.pow( wreck.radius, 2 );
    if( d2 < r2 ) {
        return true;
    }
    return false;
}

function stopReaper( reaper ) {
    var xDir = reaper.xPos - reaper.xVel;
    var yDir = reaper.yPos - reaper.yVel;
    return '' + xDir + ' ' + yDir + ' 150';
}

var reapers = {};
var wrecks = {};
var myReaper;

// game loop
while (true) {
    
    var movement = "";
    
    
    var myScore = parseInt(readline());
    var enemyScore1 = parseInt(readline());
    var enemyScore2 = parseInt(readline());
    var myRage = parseInt(readline());
    var enemyRage1 = parseInt(readline());
    var enemyRage2 = parseInt(readline());
    
    
    var unitCount = parseInt(readline());
    
    var topWaterQuantity = 0;
    var topWreckId = 0;
    
    var insideWreck = false;

    for (var i = 0; i < unitCount; i++) {
        var inputs = readline().split(' ');
        var unitId = parseInt(inputs[0]);
        var unitType = parseInt(inputs[1]);
        if( unitType == 0 ) {
            var tmpReaper;
            if( reapers[unitId] ) {
                tmpReaper = reapers[unitId];
            } else {
                tmpReaper = new Reaper();
                tmpReaper.unitId = unitId;
                reapers[unitId] = tmpReaper;
            }
            
            tmpReaper.playerId = parseInt(inputs[2]);
            
            if( tmpReaper.playerId == 0 && !myReaper) {
                myReaper = tmpReaper;
            }
            
            tmpReaper.mass = parseFloat(inputs[3]);
            tmpReaper.radius = parseInt(inputs[4]);
            tmpReaper.xPos = parseInt(inputs[5]);
            tmpReaper.yPos = parseInt(inputs[6]);
            tmpReaper.xVel = parseInt(inputs[7]);
            tmpReaper.yVel = parseInt(inputs[8]);
        } else if( unitType == 4 ) {
            var tmpWreck;
            if( wrecks[unitId]) {
                tmpWreck = wrecks[unitId];   
            } else {
                tmpWreck = new Wreck();
                tmpWreck.unitId = unitId;
                wrecks[unitId] = tmpWreck;
            }
            
            tmpWreck.radius = parseInt(inputs[4]);
            tmpWreck.xPos = parseInt(inputs[5]);
            tmpWreck.yPos = parseInt(inputs[6]);
            tmpWreck.waterQuantity = parseInt(inputs[9]);
            
            if( tmpWreck.waterQuantity > topWaterQuantity ) {
                topWreckId = unitId;
                topWaterQuantity = tmpWreck.waterQuantity;
            }
            
            if( checkInsideRadius( tmpWreck, myReaper ) && !insideWreck) {
                insideWreck = true;   
            }
        }

        // var player = parseInt(inputs[2]);
        // var mass = parseFloat(inputs[3]);
        // var radius = parseInt(inputs[4]);
        // var x = parseInt(inputs[5]);
        // var y = parseInt(inputs[6]);
        // var vx = parseInt(inputs[7]);
        // var vy = parseInt(inputs[8]);
        // var extra = parseInt(inputs[9]);
        // var extra2 = parseInt(inputs[10]);
    }
    
    if( insideWreck ) {
        if( myReaper.xVel == 0 && myReaper.yVel == 0 ) {
            movement = 'WAIT';   
        } else {
            movement = stopReaper( myReaper );   
        }
    } else {
        var tmpWreck = wrecks[topWreckId];
        movement = '' + tmpWreck.xPos + ' ' + tmpWreck.yPos + ' 150';
    }

    // Write an action using print()
    // To debug: printErr('Debug messages...');
    
    // Calc Fastest route to top quantity 

    print( movement );
    print( 'WAIT' );
    print( 'WAIT' );
}