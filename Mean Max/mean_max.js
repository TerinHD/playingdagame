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

function Destroyer() {
    var unitId = -1;
    var playerId = -1;
    var mass = -1;
    var radius = -1;
    var xPos = 0;
    var yPos = 0;
    var xVel = 0;
    var yVel = 0;
}

function Doof() {
    var unitId = -1;
    var playerId = -1;
    var mass = -1;
    var radius = -1;
    var xPos = 0;
    var yPos = 0;
    var xVel = 0;
    var yVel = 0;
}

function Tanker() {
    var unitId = -1;
    var mass = -1;
    var radius = -1;
    var xPos = 0;
    var yPos = 0;
    var xVel = 0;
    var yVel = 0;
    var waterQuantity = -1;
    var waterCapacity = -1;
}

function Wreck() {
    var unitId = -1;
    var radius = -1;
    var xPos = 0;
    var yPos =0;
    var waterQuantity = -1;
}

function createUpdateReaper( unitId, inputs ) {
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
    
    return tmpReaper;
}

function createUpdateDestroyer( unitId, inputs ) {
    var tmpDestroyer;
    if( destroyers[unitId] ) {
        tmpDestroyer = destroyers[unitId];
    } else {
        tmpDestroyer = new Destroyer();
        tmpDestroyer.unitId = unitId;
        destroyers[unitId] = tmpDestroyer;
    }
    
    tmpDestroyer.playerId = parseInt(inputs[2]);
    
    if( tmpDestroyer.playerId == 0 && !myDestroyer) {
        myDestroyer = tmpDestroyer;
    }
    
    tmpDestroyer.mass = parseFloat(inputs[3]);
    tmpDestroyer.radius = parseInt(inputs[4]);
    tmpDestroyer.xPos = parseInt(inputs[5]);
    tmpDestroyer.yPos = parseInt(inputs[6]);
    tmpDestroyer.xVel = parseInt(inputs[7]);
    tmpDestroyer.yVel = parseInt(inputs[8]);
    
    return tmpDestroyer;
}

function createUpdateDoof( unitId, inputs ) {
    var tmpDoof;
    if( doofs[unitId] ) {
        tmpDoof = doofs[unitId];
    } else {
        tmpDoof = new Doof();
        tmpDoof.unitId = unitId;
        doofs[unitId] = tmpDoof;
    }
    
    tmpDoof.playerId = parseInt(inputs[2]);
    
    if( tmpDoof.playerId == 0 && !myDoof) {
        myDoof = tmpDoof;
    }
    
    tmpDoof.mass = parseFloat(inputs[3]);
    tmpDoof.radius = parseInt(inputs[4]);
    tmpDoof.xPos = parseInt(inputs[5]);
    tmpDoof.yPos = parseInt(inputs[6]);
    tmpDoof.xVel = parseInt(inputs[7]);
    tmpDoof.yVel = parseInt(inputs[8]);
    
    return tmpDoof;
}

function createUpdateTanker( unitId, inputs ) {
    var tmpTanker;
    if( tankers[unitId] ) {
        tmpTanker = tankers[unitId];
    } else {
        tmpTanker = new Tanker();
        tmpTanker.unitId = unitId;
        tankers[unitId] = tmpTanker;
    }
    
    tmpTanker.mass = parseFloat(inputs[3]);
    tmpTanker.radius = parseInt(inputs[4]);
    tmpTanker.xPos = parseInt(inputs[5]);
    tmpTanker.yPos = parseInt(inputs[6]);
    tmpTanker.xVel = parseInt(inputs[7]);
    tmpTanker.yVel = parseInt(inputs[8]);
    tmpTanker.waterQuantity = parseInt(inputs[9]);
    tmpTanker.waterCapacity = parseInt(inputs[10]);
    
    return tmpTanker;
}


function createUpdateWreck( unitId, inputs ) {
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
    
    return tmpWreck;
}

function checkInsideRadius( wreck, reaper ) {
    var d2 = Math.pow( reaper.xPos - wreck.xPos, 2 ) + Math.pow( reaper.yPos - wreck.yPos, 2);
    var r2 = Math.pow( wreck.radius, 2 );
    if( d2 < r2 ) {
        return true;
    }
    return false;
}

function stopVehicle( vehicle ) {
    var xDir = vehicle.xPos - vehicle.xVel;
    var yDir = vehicle.yPos - vehicle.yVel;
    return '' + xDir + ' ' + yDir + ' 150';
}

// Vehicle Lists
var reapers = {};
var destroyers = {};
var doofs = {};
var tankers = {};

// Wrecks
var wrecks = {};

// My Vehicles
var myReaper;
var myDestroyer;
var myDoof;

// game loop
while (true) {
    
    var reaperMovement = 'WAIT';
    var destroyerMovement = 'WAIT';
    var doofMovement = 'WAIT';
    
    var myScore = parseInt(readline());
    var enemyScore1 = parseInt(readline());
    var enemyScore2 = parseInt(readline());
    var myRage = parseInt(readline());
    var enemyRage1 = parseInt(readline());
    var enemyRage2 = parseInt(readline());
    
    
    var unitCount = parseInt(readline());
    
    var topWaterQuantity = 0;
    var topWreckId = -1;
    
    // Clear Tankers
    tankers = {};
    var lastTankerId = -1;
    
    var reaperInsideWreck = false;

    for (var i = 0; i < unitCount; i++) {
        var inputs = readline().split(' ');
        var unitId = parseInt(inputs[0]);
        var unitType = parseInt(inputs[1]);
        if( unitType == 0 ) {
            createUpdateReaper( unitId, inputs );
        } else if( unitType == 1) {
            createUpdateDestroyer( unitId, inputs );
        } else if( unitType == 2) {
            createUpdateDoof( unitId, inputs );
        } else if( unitType == 3) {
            createUpdateTanker( unitId, inputs );
            lastTankerId = unitId;
        } else if( unitType == 4 ) {
            var tmpWreck = createUpdateWreck( unitId, inputs );
            
            if( tmpWreck.waterQuantity > topWaterQuantity ) {
                topWreckId = unitId;
                topWaterQuantity = tmpWreck.waterQuantity;
            }
            
            if( checkInsideRadius( tmpWreck, myReaper ) && !reaperInsideWreck) {
                reaperInsideWreck = true;   
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
    
    if( reaperInsideWreck ) {
        if( myReaper.xVel == 0 && myReaper.yVel == 0 ) {
            reaperMovement = 'WAIT';   
        } else {
            reaperMovement = stopVehicle( myReaper );   
        }
    } else {
        if( topWreckId !== -1 ) {
            var tmpWreck = wrecks[topWreckId];
            reaperMovement = '' + tmpWreck.xPos + ' ' + tmpWreck.yPos + ' 150';
        } else {
            reaperMovement = stopVehicle( myReaper );
        }
    }
    
    if( lastTankerId != -1 ) {
        var tanker = tankers[lastTankerId];
        destroyerMovement = '' + tanker.xPos + ' ' + tanker.yPos + ' 299'; 
    } else {
        destroyerMovement = stopVehicle(myDestroyer);
    }

    // Write an action using print()
    // To debug: printErr('Debug messages...');
    
    // Calc Fastest route to top quantity 

    print( reaperMovement );
    print( destroyerMovement );
    print( doofMovement );
}