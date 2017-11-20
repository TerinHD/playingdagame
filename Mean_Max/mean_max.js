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
    var friction = 0.2;
    var throttle = 0;
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
    var friction = 0.3;
    var throttle = 0;
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
    var friction = 0.3;
    var throttle = 0;
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
    var friction = 0.4;
    var throttle = 500;
}

function Wreck() {
    var unitId = -1;
    var radius = -1;
    var xPos = 0;
    var yPos =0;
    var waterQuantity = -1;
}

function TarPool() {
    var unitId = -1;
    var radius = -1;
    var xPos = 0;
    var yPos = 0;
}

function OilPool() {
    var unitId = -1;
    var radius = -1;
    var xPos = 0;
    var yPos = 0;
}

function Point() {
    var xPos = 0;
    var yPos = 0;
}

function createUpdateReaper( unitId, inputs ) {
    var tmpReaper; 
    
    if( reapers[unitId] ) {
        tmpReaper = reapers[unitId];
    } else if( unitId === myReaper.unitId ) {
        tmpReaper = myReaper;
    } else {
        tmpReaper = new Reaper();
        tmpReaper.unitId = unitId;
        tmpReaper.playerId = parseInt(inputs[2]);
        if( tmpReaper.playerId === 0 && !myReaper) {
            myReaper = tmpReaper;
        } else {    
            reapers[unitId] = tmpReaper;
        }
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
    } else if( unitId === myDestroyer.unitId) {
        tmpDestroyer = myDestroyer;
    } else {
        tmpDestroyer = new Destroyer();
        tmpDestroyer.unitId = unitId;
        tmpDestroyer.playerId = parseInt(inputs[2]);
        if( tmpDestroyer.playerId === 0 && !myDestroyer) {
            myDestroyer = tmpDestroyer;
        } else {
            destroyers[unitId] = tmpDestroyer;
        }
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
    } else if( unitId === myDoof.unitId ) {
        tmpDoof = myDoof;
    } else {
        tmpDoof = new Doof();
        tmpDoof.unitId = unitId;
        tmpDoof.playerId = parseInt(inputs[2]);
        if( tmpDoof.playerId === 0 && !myDoof) {
            myDoof = tmpDoof;
        } else {
            doofs[unitId] = tmpDoof;
        }
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

function createTarPool( unitId, inputs ) {
    var tmpTarPool = new TarPool();
    tmpTarPool.unitId = unitId;
    tarPools[unitId] = tmpTarPool;
    
    tmpTarPool.radius = parseInt(inputs[4]);
    tmpTarPool.xPos = parseInt(inputs[5]);
    tmpTarPool.yPos = parseInt(inputs[6]);
    
    return tmpTarPool;
}

function createOilPool( unitId, inputs ) {
    var tmpOilPool = new OilPool();
    tmpOilPool.unitId = unitId;
    oilPools[unitId] = tmpOilPool;
    
    tmpOilPool.radius = parseInt(inputs[4]);
    tmpOilPool.xPos = parseInt(inputs[5]);
    tmpOilPool.yPos = parseInt(inputs[6]);
    
    return tmpOilPool;
}

function checkInsideRadius( target, reaper ) {
    var d2 = Math.pow( reaper.xPos - target.xPos, 2 ) + Math.pow( reaper.yPos - target.yPos, 2);
    var r2 = Math.pow( target.radius, 2 );
    if( d2 < r2 ) {
        return true;
    }
    return false;
}

function distanceToPoint( vehicle, pointX, pointY) {
    return Math.sqrt( (vehicle.xPos - pointX) * (vehicle.xPos - pointX) + (vehicle.yPos - pointY) * (vehicle.yPos - pointY));
}

function calculateVehicleTrajectory( vehicle ) {
    var pointToReturn = new Point();
    pointToReturn.xPos = vehicle.xPos + vehicle.xVel;
    pointToReturn.yPos = vehicle.yPos + vehicle.yVel;
    return pointToReturn;
}

function distanceToVehicle( vehicle1, vehicle2 ) {
    return distanceToPoint( vehicle1, vehicle2.xPos, vehicle2.yPos );  
}

function distanceToVehicleTrajectory( vehicle1, vehicle2 ) {
    var pointInFuture = calculateVehicleTrajectory( vehicle2 );
    return distanceToPoint( vehicle1, pointsInFuture.xPos, pointsInFuture.yPos);
}

function stopVehicle( vehicle ) {
    var xDir = vehicle.xPos - vehicle.xVel;
    var yDir = vehicle.yPos - vehicle.yVel;
    var dist = distanceToPoint( vehicle, xDir, yDir );
    var power = Math.abs(Math.round(dist * vehicle.mass));
    printErr( "Power for stop: " + power ); 
    if( power > 300 ) {
        power = 300;   
    }
    return '' + xDir + ' ' + yDir + ' ' + power;
}

function navigateToPoint( vehicle, pointX, pointY) {
    var dist = distanceToPoint( vehicle, pointX, pointY);
    var power = ((vehicle.xPos - pointX - vehicle.xVel)/(pointX - vehicle.xPos)) * dist * vehicle.mass;
    power = Math.abs(Math.round(power));
    printErr( "Power for Navigation: " + power ); 
    if( power > 300 ) {
        power = 300;   
    }
    return '' + pointX + ' ' + pointY + ' ' + power;
}

function navigateToVehicle( vehicle1, vehicle2) {
    var targetVehiclePoint = calculateVehicleTrajectory( vehicle2 );
    return navigateToPoint( vehicle1, targetVehiclePoint.xPos, targetVehiclePoint.yPos );
}

function navigateToClosestWreck( reaper, wrecks, backupAction ) {
    var targetWreck = null;
    var closestDist = null;
    for (var key in wrecks) {
        if (wrecks.hasOwnProperty(key) ) {
            var tmpWreck = wrecks[key];
            if(!targetWreck) {
                targetWreck = tmpWreck;
                closestDist = distanceToVehicle( reaper, tmpWreck );
            } else {
                tmpDist = distanceToVehicle( reaper, tmpWreck );
                if( tmpDist < closestDist ) {
                    targetWreck = tmpWreck;
                }
            }
        } 
    }
    
    if( targetWreck ) {
        return navigateToPoint( reaper, targetWreck.xPos, targetWreck.yPos);
    } else {
        return backupAction;
    }
}

function navigateToClosestVehicle( vehicle, vehicles, backupAction ) {
    var targetVehicle = null;
    var closestDist = null;
    for (var key in vehicles) {
        if (vehicles.hasOwnProperty(key) ) {
            var tmpVehicle = vehicles[key];
            if(!targetVehicle) {
                targetVehicle = tmpVehicle;
                closestDist = distanceToVehicle( vehicle, tmpVehicle );
            } else {
                tmpDist = distanceToVehicle( vehicle, tmpVehicle );
                if( tmpDist < closestDist ) {
                    targetVehicle = tmpVehicle;
                }
            }
        } 
    }
    
    if( targetVehicle ) {
        return navigateToVehicle( vehicle, targetVehicle);
    } else {
        return backupAction;
    }
}


// Vehicle Lists
var reapers = {};
var reaperIds = [];

var destroyers = {};
var doofs = {};
var tankers = {};

// Wrecks
var wrecks = {};

// Pools
var tarPools = {};
var oilPools = {};

// ******** My Vehicles ******** //

// Reaper Variables
var myReaper;

// Destroyer Variables
var myDestroyer;


// Doof Variables
var myDoof;
var turnCount = 0;
var xDesiredPos = -4000;
var yDesiredPos = -4000;
var xAdd = true;
var yAdd = true;

// game loop
while (true) {
    
    turnCount++;
    
    var reaperAction = 'WAIT';
    var destroyerAction = 'WAIT';
    var doofAction = 'WAIT';
    
    var myScore = parseInt(readline());
    var enemyScore1 = parseInt(readline());
    var enemyScore2 = parseInt(readline());
    var myRage = parseInt(readline());
    var enemyRage1 = parseInt(readline());
    var enemyRage2 = parseInt(readline());
    
    
    var unitCount = parseInt(readline());
    
    var topWaterQuantity = 0;
    var topWreckId = -1;
    
    // Clear Tankers & Wrecks
    tankers = {};
    wrecks = {};
    tarPools = {};
    oilPools = {};
    var lastTankerId = -1;
    
    var reaperInsideWreck = false;

    for (var i = 0; i < unitCount; i++) {
        var inputs = readline().split(' ');
        var unitId = parseInt(inputs[0]);
        var unitType = parseInt(inputs[1]);
        if( unitType === 0 ) {
            createUpdateReaper( unitId, inputs );
            if( !reaperIds[unitId] ) {
                reaperIds.push(unitId);   
            }
        } else if( unitType === 1) {
            createUpdateDestroyer( unitId, inputs );
        } else if( unitType === 2) {
            createUpdateDoof( unitId, inputs );
        } else if( unitType === 3) {
            createUpdateTanker( unitId, inputs );
            lastTankerId = unitId;
        } else if( unitType === 4 ) {
            var tmpWreck = createUpdateWreck( unitId, inputs );
            
            if( tmpWreck.waterQuantity > topWaterQuantity ) {
                topWreckId = unitId;
                topWaterQuantity = tmpWreck.waterQuantity;
            }
            
            if( checkInsideRadius( tmpWreck, myReaper ) && !reaperInsideWreck) {
                reaperInsideWreck = true;   
            }
        } else if( unitType === 5) {
            createTarPool( unitId, inputs );   
        } else if( unitType === 6) {
            createOilPool( unitId, inputs );
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
    
    
    // Calculate Reaper Actions
    if( reaperInsideWreck ) {
        if( myReaper.xVel === 0 && myReaper.yVel == 0 ) {
            reaperAction = 'WAIT';   
        } else {
            reaperAction = stopVehicle( myReaper );   
        }
    } else {
        // if( topWreckId !== -1 ) {
        //     var tmpWreck = wrecks[topWreckId];
        //     reaperAction = navigateToPoint( myReaper, tmpWreck.xPos, tmpWreck.yPos );
        // } else {
            // reaperAction = stopVehicle( myReaper );
        // }
        
        // var backupAction = stopVehicle( reaper );
        var backupAction = navigateToVehicle( myReaper, myDestroyer );
        
        reaperAction = navigateToClosestWreck( myReaper, wrecks, backupAction );
    }
    
    
    
    // Calculate Destroyer Actions
    
    destroyerAction = navigateToClosestVehicle( myDestroyer, tankers, "WAIT" );
    
    
    
    // Calculate Doof Actions
    
    if( xDesiredPos > 4000 ) {
        xAdd = false;   
    } else if (xDesiredPos < -4000 ) {
        xAdd = true;
    }
    
    if( yDesiredPos > 4000 ) {
        yAdd = false;   
    } else if (yDesiredPos < -4000 ) {
        yAdd = true;
    }
    
    if( xAdd ) {
        xDesiredPos = xDesiredPos + 1000;
    } else {
        xDesiredPos = xDesiredPos - 1000;   
    }
    
    if( yAdd ) {
        yDesiredPos = yDesiredPos + 1000;
    } else {
        yDesiredPos = yDesiredPos - 1000;   
    }
        
    doofAction = '' + xDesiredPos + ' ' + yDesiredPos + ' 299';
    
    // Report Our Actions

    print( reaperAction + " Traitor" );
    print( destroyerAction + " Burner" );
    print( doofAction + " Proc" );
}