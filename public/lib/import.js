function _import( file, is_wav = false) {
  return new Promise( function( resolve, reject ) {
    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
    let reader = new FileReader();
    if ( is_wav ) {
        reader.readAsArrayBuffer( file )
    } else {
        reader.readAsText( file )
    }
    reader.addEventListener( 'loadend', function ( e ) {
      let text = e.target.result
      resolve ( text )
    })
    reader.addEventListener( 'error'  , function ( e ) {
      if ( e.target.error.name == "NotReadableError" ) {
        console.error ( "Couldn't read file." )
      } else {
        console.error ( "Error importing." )
      }
    })
  })
}

async function import_json( file ) {
  let data = await _import ( file )
  return JSON.parse ( data )
}

async function import_csv( file ) {
  return await _import ( file )
}

async function import_wav( file ) {
  let data = await _import ( file, true )
  return decode_wav( data )
}
