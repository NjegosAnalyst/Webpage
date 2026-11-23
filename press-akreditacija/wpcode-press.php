/**
 * WPCode PHP snippet: "Press akreditacija - tabela i provjere" (Run everywhere)
 * 1) Poslije svake prijave sa formulara press akreditacije (SR i EN) šalje red u Google Sheets.
 * 2) Ako je upisan snimatelj/fotograf, traži i njegov mobilni i email.
 * Prepoznaje formular po skrivenom polju obrazac = press-otvaranje-2627.
 */
if ( ! defined( 'ABSPATH' ) ) { return; }

define( 'JPA_OBRAZAC', 'press-otvaranje-2627' );
define( 'JPA_SHEETS_URL', 'UPISATI_URL_WEB_APLIKACIJE' ); // https://script.google.com/macros/s/.../exec

function jpa_je_nas_formular() {
	return isset( $_POST['obrazac'] ) && JPA_OBRAZAC === wp_unslash( $_POST['obrazac'] );
}

/* 2) snimatelj i dodatni novinari: ime upisano -> mobilni i email obavezni */
add_filter( 'wpcf7_validate', function ( $result, $tags ) {
	if ( ! jpa_je_nas_formular() ) { return $result; }
	$en  = isset( $_POST['jezik'] ) && 'EN' === wp_unslash( $_POST['jezik'] );
	$msg = $en ? 'Required when this person is listed.' : 'Obavezno kad je osoba upisana.';
	foreach ( array( 'sni', 'nov2', 'nov3' ) as $p ) {
		$ime = isset( $_POST[ $p . '-ime' ] ) ? trim( wp_unslash( $_POST[ $p . '-ime' ] ) ) : '';
		if ( '' === $ime ) { continue; }
		foreach ( $tags as $tag ) {
			if ( in_array( $tag->name, array( $p . '-mobilni', $p . '-email' ), true ) ) {
				$v = isset( $_POST[ $tag->name ] ) ? trim( wp_unslash( $_POST[ $tag->name ] ) ) : '';
				if ( '' === $v ) { $result->invalidate( $tag, $msg ); }
			}
		}
	}
	return $result;
}, 20, 2 );

/* 1) red u Google Sheets (i kad mail ne uspije, da se prijava ne izgubi) */
add_action( 'wpcf7_submit', function ( $form, $res ) {
	if ( ! in_array( $res['status'] ?? '', array( 'mail_sent', 'mail_failed' ), true ) ) { return; }
	if ( ! jpa_je_nas_formular() || false === strpos( JPA_SHEETS_URL, 'https://' ) ) { return; }
	$t = function ( $tag ) { return trim( wpcf7_mail_replace_tags( $tag, array( 'html' => false ) ) ); };
	$spoji = function ( $dijelovi, $sep = ' · ' ) { return implode( $sep, array_filter( array_map( 'trim', $dijelovi ) ) ); };

	$snimatelj = '';
	if ( '' !== $t( '[sni-ime]' ) ) {
		$snimatelj = $spoji( array( $t( '[sni-ime]' ) . ( $t( '[sni-funkcija]' ) ? ' (' . $t( '[sni-funkcija]' ) . ')' : '' ), $t( '[sni-mobilni]' ), $t( '[sni-email]' ) ) );
	}
	$red = array(
		'obrazac'       => JPA_OBRAZAC,
		'vrijeme'       => wp_date( 'd.m.Y H:i:s' ),
		'medij'         => $t( '[medij-naziv]' ),
		'vrsta'         => $t( '[medij-vrsta]' ),
		'drzava'        => $t( '[medij-drzava]' ),
		'grad'          => $t( '[medij-grad]' ),
		'novinar'       => $spoji( array( $t( '[nov-ime]' ), $t( '[nov2-ime]' ), $t( '[nov3-ime]' ) ), "\n" ),
		'kontakt'       => $spoji( array(
			$spoji( array( $t( '[nov-mobilni]' ), $t( '[nov-email]' ) ) ),
			$spoji( array( $t( '[nov2-mobilni]' ), $t( '[nov2-email]' ) ) ),
			$spoji( array( $t( '[nov3-mobilni]' ), $t( '[nov3-email]' ) ) ),
		), "\n" ),
		'snimatelj'     => $snimatelj,
		'nastupi'       => $t( '[nastupi]' ),
		'potrebe'       => $spoji( array( $t( '[potrebe-izbor]' ), $t( '[potrebe]' ) ), ' – ' ),
		'medij_email'   => $t( '[medij-email]' ),
		'medij_telefon' => $t( '[medij-telefon]' ),
		'medij_link'    => $t( '[medij-link]' ),
		'nov_funkcija'  => $spoji( array( $t( '[nov-funkcija]' ), $t( '[nov2-funkcija]' ), $t( '[nov3-funkcija]' ) ), "\n" ),
		'jezik'         => $t( '[jezik]' ),
		'broj'          => $t( '[_serial_number]' ),
	);
	$r = wp_remote_post( JPA_SHEETS_URL, array(
		'timeout'     => 12,
		'redirection' => 0, // Google odgovara preusmjerenjem; red je već upisan
		'headers'     => array( 'Content-Type' => 'application/json' ),
		'body'        => wp_json_encode( $red ),
	) );
	if ( is_wp_error( $r ) || ! in_array( (int) wp_remote_retrieve_response_code( $r ), array( 200, 302 ), true ) ) {
		$greske   = get_option( 'jpa_sheets_greske', array() );
		$greske[] = array( 'vrijeme' => $red['vrijeme'], 'medij' => $red['medij'], 'novinar' => $red['novinar'], 'greska' => is_wp_error( $r ) ? $r->get_error_message() : wp_remote_retrieve_response_code( $r ) );
		update_option( 'jpa_sheets_greske', array_slice( $greske, -50 ), false );
	}
}, 5, 2 );
