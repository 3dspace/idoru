/**
 * @author Pete Gray / http://3dspace.com
 */

"use strict";
 
function ArtificialCharacter ( object ) {
	var clock = new THREE.Clock ( true );
	this.avatar = new DefaultIdoruAvatar( clock );
	scene.add( this.avatar.getAvatarGeometry() );
	this.characterControl = new CharacterControl( this );
	this.updateCharacter = function () {		
		this.characterControl.update();
	}
	this.setExpression = function ( expression ) {
		this.avatar.setExpression( expression );
	}
}
 
function CharacterControl ( character ) {
	var character = character;
	var clock = character.clock;
	var awarenessOfUser = new AwarenessOfUser( this );
	var jobOutline = new JobOutline();
	var avatarControl = new AvatarControl( character.avatar, clock );
	avatarControl.openEyes();
	this.update = function () {		
		avatarControl.update();
	}	
}

// Always paying attention to the user, but able to pay attention to the virtual world and the task at hand as well.
// AwarenessOfUser is continually monitoring the user, and notifies CharacterController of any noteworthy actions.
// Also serializes and reports data for analysis of user engagement.
function AwarenessOfUser ( control ) {
	var characterControl = control;
	var clock = control.clock;
}

// Specifics of the ArtificialCharacters intended purpose in the virtual world.
function JobOutline (  ) {
	// this version of the idoru is going to charm school, and as such, has no job other than that for the time being.
}

// CharacterControl operates the avatar through this object. It can be adapted to interpret CharacterControl directives
// to avatars with different parts or freedoms of movement.
function AvatarControl ( avatar, clock ) {
	var avatar = avatar;
	var clock = clock;
	var gestureManager = new GestureManager( avatar, clock );
	this.update = function () {
		avatar.updateAutomatics();
		gestureManager.updateGestures();
	}
	this.openEyes = function () {		
		avatar.openEyes();
		//gestureManager.smile();
	}
}

// Manages gestures and expressions.
function GestureManager ( avatar, clock ) {
	var avatar = avatar;
	var clock = clock;
	this.updateGestures = function () {

	}
	this.smile = function () {
		avatar.setLeftUpperEyelid( -0.5 );
		avatar.setLeftLowerEyelid( -0.1 );
		avatar.setLeftEyeRotation( -0.3 );
	}
}


// A simple but smooth interpolator for gestures and movements.
// And yes, I do get a Sade song stuck in my head every time I instantiate one...  https://www.youtube.com/watch?v=4TYv2PhG89A
function SmoothInterpolator( clock, duration, start, finish ) {
	this.clock = clock;
	this.duration = duration;
	this.start = start;
	this.finish = finish;
	this.change = finish - start;
	this.startTime = clock.getElapsedTime();
	this.getCurrentValue = function () {
		var elapsed = ( clock.getElapsedTime() - this.startTime );
		if ( elapsed > duration ) {
			return null;
		}
		var progress = elapsed / this.duration;
		// Where the "smoothing" happens
		var smoothProgress = ( Math.cos( progress * Math.PI ) / -2 + 0.5 );
		return ( ( this.start ) + ( this.change * smoothProgress ) );
	}
}



// For use when an external avatar does not exist. Allows us to experiment with expressions, gestures, body language, and spatial relations with the user.
// Creates a simple default avatar using 10 primitives - 9 spheres and a cylinder.	
function DefaultIdoruAvatar ( clock ) {

	var clock = clock;
	var leftUpperEyelidOpen = -0.40;
	var rightUpperEyelidOpen = -0.45;
	var lowerEyelidOpen = 0.60;
	var blinking = false;
	var blinkPause = false;
	var lastBlinkTime = 0;
	var timeUntilNextBlink = 2;
	var headTilting = false;
	var lastTiltTime = 0;
	var timeUntilNextTilt = 2.5;
	var nextHeadTiltX = null;
	var eyesRotating = false;
	var lastEyeRotationTime = 0;
	var timeUntilNextEyeRotation = 1.5;
	var hasExpressed = false;
	var headAngleX = 0;
	var headAngleY = 0;
	var headAngleZ = 0;
	var headSlideZ = 0;
	var eyeRotation = 0.24;
	var inverseBlink = false;
	var consecutiveBlinks = 0;
	var fudgeFactor = 1;

	// Various Object3Ds for use and containers and controllers for other inner components.
	var idoruAvatar = new THREE.Object3D();
	var headHolder = new THREE.Object3D();
	var innerHeadHolder = new THREE.Object3D();
	var leftEyeHolder = new THREE.Object3D();
	var rightEyeHolder = new THREE.Object3D();
	var bodyHolder = new THREE.Object3D();
	
	// Head
	var headGeometry = new THREE.SphereGeometry( 0.5, 16, 6 );
	var material = new THREE.MeshPhongMaterial( { color: 0x8899aa, emissive: 0x222255, shininess: 20 } );
	var head = new THREE.Mesh( headGeometry, material );
	head.scale.y = 0.7;
	innerHeadHolder.add( head );
	headHolder.add( innerHeadHolder );
	innerHeadHolder.rotation.x = headAngleX;
	//headHolder.rotation.z = 0.03;
	idoruAvatar.add( headHolder );
	
	// Eyes - the most sophisticated component of the default avatar.
	// Eye materials and geometries
	var eyeMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, emissive: 0x333333, shininess: 60 } );
	var eyeGeometry = new THREE.SphereGeometry( 0.15, 12, 12 );
	var pupilMaterial = new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0xffffff, shininess: 300 } );
	var pupilGeometry = new THREE.SphereGeometry( 0.08, 9, 9 );
	var eyelidMaterial = new THREE.MeshPhongMaterial( { color: 0xaabbdd, emissive: 0x111133, shininess: 30, side: THREE.DoubleSide } );
	var upperEyelidGeometry = new THREE.SphereGeometry( 0.16, 16, 4, 0, 6.28, 0, 1.6 );
	var lowerEyelidGeometry = new THREE.SphereGeometry( 0.16, 16, 4, 0, 6.28, 1.6, 1.6 );
	
	// Left eye
	var leftEye = new THREE.Mesh( eyeGeometry, eyeMaterial );
	var leftPupil = new THREE.Mesh( pupilGeometry, pupilMaterial );
	leftEyeHolder.add( leftEye );
	leftPupil.position.z = 0.09;
	leftEyeHolder.add( leftPupil );		
	leftEyeHolder.position.z = 0.42;
	leftEyeHolder.position.x = 0.17;
	var leftUpperEyelid = new THREE.Mesh( upperEyelidGeometry, eyelidMaterial );
	leftUpperEyelid.position.z = 0.02;
	var leftLowerEyelid = new THREE.Mesh( lowerEyelidGeometry, eyelidMaterial );	
	leftLowerEyelid.position.z = 0.02;
	leftEyeHolder.add( leftUpperEyelid );
	leftEyeHolder.add( leftLowerEyelid );		
	leftEyeHolder.rotation.z = -eyeRotation;
	innerHeadHolder.add( leftEyeHolder );
	
	// Right eye
	var rightEye = new THREE.Mesh( eyeGeometry, eyeMaterial );
	var rightPupil = new THREE.Mesh( pupilGeometry, pupilMaterial );
	rightEyeHolder.add( rightEye );
	rightPupil.position.z = 0.09;
	rightEyeHolder.add( rightPupil );		
	rightEyeHolder.position.z = 0.42;
	rightEyeHolder.position.x = -0.17;
	var rightUpperEyelid = new THREE.Mesh( upperEyelidGeometry, eyelidMaterial );
	rightUpperEyelid.position.z = 0.02;
	var rightLowerEyelid = new THREE.Mesh( lowerEyelidGeometry, eyelidMaterial );
	rightLowerEyelid.position.z = 0.02;
	rightEyeHolder.add( rightUpperEyelid );
	rightEyeHolder.add( rightLowerEyelid );		
	rightEyeHolder.rotation.z = eyeRotation;
	innerHeadHolder.add( rightEyeHolder );
	
	// Body
	var bodyGeometry = new THREE.CylinderGeometry( 0.05, 0.6, 1.1, 7, 2 );
	var body = new THREE.Mesh( bodyGeometry, material );
	body.position.z = -0.03;
	bodyHolder.add( body );
	idoruAvatar.add( bodyHolder );
	innerHeadHolder.scale.z = 0.6;
	bodyHolder.scale.z = 0.6;
	
	idoruAvatar.position.y = 0.30;
	idoruAvatar.rotation.x = 0.18;
	
	this.setLeftUpperEyelid = function ( angle ) {
		this.angle = angle; leftUpperEyelid.rotation.x = angle;
	}
	this.setLeftLowerEyelid = function ( angle ) {
		this.angle = angle; leftLowerEyelid.rotation.x = angle;
	}
	this.setLeftEyeRotation = function ( angle ) {
		leftEyeHolder.rotation.x = angle;
	}
	
	this.setExpression = function( expression ) {
		if ( expression == "smile" ) {
			nextHeadTiltX = 0.25;
			console.log( "Smile requested", expression );
		}
	}
	
	// Things like breathing, blinking, other subtle avatar-specific effect that persist in the absence of an interaction with a user
	this.updateAutomatics = function() {
		var elapsed = clock.getElapsedTime();
		var slightElapsed = elapsed / 5;
		// cheap hack to rotate the pupils, adding a slight twinkle effect to the eyes
		leftPupil.rotation.y = slightElapsed;
		rightPupil.rotation.y = slightElapsed;
		// cheap hack to oscillate the shininess of the pupil material, adding a slight twinkle effect to the eyes
		pupilMaterial.shininess = 300 + ( Math.sin( elapsed * 5.5 ) * 32 )
		// cheap hack to give the impression of breathing
		var interval = Math.sin( ( elapsed * 1.2 ) + 2 ) ;
		body.scale.y = 1 + ( interval / 10 );
		body.position.y = ( interval / 15 ) - 0.6;
		headHolder.position.y = ( interval / 95 );
		// cheap hack to rotate the body. What the heck, the more the thing is in constant, subtle motion, the more I feel it is achieving its objective of being charming.
		body.rotation.y = ( elapsed / 7 );
		this.updateHeadTilt();
		this.updateEyeRotation();
		this.updateBlink();
	}
	
	this.updateEyeRotation = function () {
		var elapsed = clock.getElapsedTime();
		this.eyeRotationInterpolator;
		if ( eyesRotating ) {
			var nextEyeRotation = this.eyeRotationInterpolator.getCurrentValue();
			//eyeRotation = ( Math.random() * 0.7 - 0.3 );
			if (nextEyeRotation == null ) {
				eyesRotating = false;
				lastEyeRotationTime = elapsed;
				return;
			} else {
				eyeRotation = nextEyeRotation;
				leftEyeHolder.rotation.z = -eyeRotation; 
				rightEyeHolder.rotation.z = eyeRotation;
			}	
			
		} else {
			if ( ( elapsed - lastEyeRotationTime ) > timeUntilNextEyeRotation ) {
				eyesRotating = true;
				lastEyeRotationTime = elapsed;
				var forNextAngle = ( Math.random() * 0.35 - 0.12 );				
				timeUntilNextEyeRotation = 0.1;
				var forNextDuration = Math.abs( forNextAngle - eyeRotation ) * 18;
				if ( hasExpressed == false ) {
					forNextAngle = -0.15;
					timeUntilNextEyeRotation = 3.0;
					forNextDuration = Math.abs( forNextAngle - eyeRotation ) * 15;
					hasExpressed = true;
				}
				this.eyeRotationInterpolator = new SmoothInterpolator( clock, forNextDuration, eyeRotation, forNextAngle );
			}
		}
	}
	
	this.updateHeadTilt = function () {
		var elapsed = clock.getElapsedTime();
		this.tiltInterpolatorX;
		this.tiltInterpolatorY;
		this.tiltInterpolatorZ;
		this.slideInterpolatorZ;
		if ( headTilting ) {
			var nextHeadAngleX = this.tiltInterpolatorX.getCurrentValue();
			var nextHeadAngleY = this.tiltInterpolatorY.getCurrentValue();
			var nextHeadAngleZ = this.tiltInterpolatorZ.getCurrentValue();
			var nextHeadSlideZ = this.slideInterpolatorZ.getCurrentValue();
			
			if ( nextHeadAngleX == null ) {
				headTilting = false;
				lastTiltTime = elapsed;				
				return;
			} else {				
				headAngleX = nextHeadAngleX;		
				headAngleY = nextHeadAngleY;		
				headAngleZ = nextHeadAngleZ;
				headSlideZ = nextHeadSlideZ;				
				innerHeadHolder.rotation.set( nextHeadAngleX, nextHeadAngleY, nextHeadAngleZ );
				// i allows over-rotation of the eyes when compensating for head rotation - enhances the illusion of eye contact
				var i = 1.35;
				leftEyeHolder.rotation.set( -nextHeadAngleX * i, -nextHeadAngleY * i, -eyeRotation ); 
				rightEyeHolder.rotation.set( -nextHeadAngleX* i , -nextHeadAngleY * i, eyeRotation );
				headHolder.position.z = nextHeadSlideZ;
			}
		} else {
			if ( ( elapsed - lastTiltTime ) > timeUntilNextTilt ) {
				headTilting = true;
				lastTiltTime = elapsed;
				timeUntilNextTilt = Math.random() * 1.0;
				var tiltDuration = Math.random() * 4.0 + 1.0;
				var xTilt = ( Math.random() * 0.6 - 0.2 );
				var yTilt = ( Math.random() * 0.4 - 0.2 );
				var zTilt = ( Math.random() * 0.4 - 0.2 );
				var zSlide = ( Math.random() * 0.075 )
				if ( nextHeadTiltX != null ) {
					xTilt = 0.40;
					yTilt = -0.20;
					zTilt = 0.25;
					tiltDuration = 3.5;
					timeUntilNextTilt = 1.2;
					zSlide = 0.08;
					nextHeadTiltX = null;
				}
				this.tiltInterpolatorX = new SmoothInterpolator( clock, tiltDuration, headAngleX, xTilt );
				this.tiltInterpolatorY = new SmoothInterpolator( clock, tiltDuration, headAngleY, yTilt );
				this.tiltInterpolatorZ = new SmoothInterpolator( clock, tiltDuration, headAngleZ,  zTilt );
				this.slideInterpolatorZ = new SmoothInterpolator( clock, tiltDuration, headSlideZ, zSlide );
			}
		}
	}
	
	// As the default character has nothing but eyelids with which to express itself - lots of silly hacks for eyelid behaviour.
	this.updateBlink = function () {
		var elapsed = clock.getElapsedTime();		
		if ( blinkPause ) { return };
		if ( blinking ) {
			var interval = Math.cos( ( elapsed - lastBlinkTime ) * 15 );
			var intervalLeft = Math.cos( ( elapsed - lastBlinkTime - 0.04 ) * 15 );
			if ( inverseBlink ) {
				leftUpperEyelid.rotation.x = leftUpperEyelidOpen * 1.1 - ( ( leftUpperEyelidOpen * 0.1 ) * intervalLeft );
				rightUpperEyelid.rotation.x = rightUpperEyelidOpen * 1.1 - ( ( rightUpperEyelidOpen * 0.1 ) * interval );
				leftLowerEyelid.rotation.x = lowerEyelidOpen * 1.1 - ( ( lowerEyelidOpen * 0.1 ) * intervalLeft );
				rightLowerEyelid.rotation.x = lowerEyelidOpen * 1.1 - ( ( lowerEyelidOpen * 0.1 ) * interval );
			} else {
				leftUpperEyelid.rotation.x = leftUpperEyelidOpen / 2 + ( ( leftUpperEyelidOpen / 2 ) * intervalLeft );
				rightUpperEyelid.rotation.x = rightUpperEyelidOpen / 2 + ( ( rightUpperEyelidOpen / 2 ) * interval );
				leftLowerEyelid.rotation.x = lowerEyelidOpen / 2 + ( ( lowerEyelidOpen / 2 ) * intervalLeft );
				rightLowerEyelid.rotation.x = lowerEyelidOpen / 2 + ( ( lowerEyelidOpen / 2 ) * interval );
			}
			if ( ( elapsed - lastBlinkTime ) > 0.448 ) {
				blinking = false;
				lastBlinkTime = elapsed;
				timeUntilNextBlink = Math.random() * 5 + 2;
				if ( Math.random() < 0.33 ) {
					inverseBlink = true;					
				} else {
					inverseBlink = false;
				}
				if ( Math.random() < 0.33 ) {
					consecutiveBlinks += 1;
					if ( consecutiveBlinks < 3 ) {
						timeUntilNextBlink = 0;						
						//console.log("consecutive Blinks", consecutiveBlinks);
					} else {
						//console.log("Quadruple Blink Blocked, just because.", consecutiveBlinks);
						consecutiveBlinks = 0;
					}
				} else {
					consecutiveBlinks = 0;
				}
				this.openEyes();
			}
		} else {
			if ( ( elapsed - lastBlinkTime ) > timeUntilNextBlink ) {
				blinking = true;
				lastBlinkTime = elapsed;				
			}
		}		
	}
	
	// Returns the top-level avatar Object3D
	this.getAvatarGeometry = function() {
		return idoruAvatar;
	}
	
	// The first function added to the idoru - the first thing it ever did. Opened its eyes and looked right at me.
	this.openEyes = function () {		
		leftUpperEyelid.rotation.x = -0.40;
		leftLowerEyelid.rotation.x = 0.6;
		rightUpperEyelid.rotation.x = -0.45;
		rightLowerEyelid.rotation.x = 0.6;		
	}

}
