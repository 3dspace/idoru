/**
 * @author 3dspace / http://3dspace.com
 */
/*global THREE, console */

( function () {

	function UserPerception ( object ) {
	
		this.object = object;
		
		// How long can a user be motionless before the idoru considers them settled
		this.timeToSettled = 5000;
		
		// Has the user been motionless for timeToSettled milliseconds
		this.userSettled = true;
	
		// "userSpace" defines the optimal location to interact with
		// the user.
		this.userSpace = new THREE.Vector3();
		
		this.isUserSettled = function () {
		
			return userSettled;
			
		}
		
	}
	

	THREE.idoru = function ( object, domElement ) {
	
		var perception = new UserPerception( object );
	
		this.domElement = ( domElement !== undefined ) ? domElement : document;
			
	
		//API
	
		this.isUserSettled = function () {
		
			return perception.isUserSettled();
			
		};
	
	}; 	

}() );
