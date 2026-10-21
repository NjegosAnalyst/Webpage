<?php
// Test jednokratnog snippeta video galerije bez WordPressa: lažne WP funkcije + Elementor sadržaj kao na sajtu
// (sekcija sa dvije kolone po 5 Video widgeta + prazna sekcija sa jednom kolonom).
// Pokretanje: php test-snippet.php   (red widgeta pravi napravi-widget.py --proba)
$DIR   = __DIR__;
$FILES = array(
	'videi.json'                 => file_get_contents( "$DIR/videi.json" ),
	'elementor-html-widget.html' => shell_exec( 'python3 ' . escapeshellarg( "$DIR/napravi-widget.py" ) . ' --proba' ),
);
$meta = array(); $options = array(); $hooks = array(); $title = array( 957 => '[:SH]Video galerija[:en]Video gallery[:]' ); $fetched = array();

function add_action( $h, $f ) { global $hooks; $hooks[ $h ][] = $f; }
function wp_doing_ajax() { return false; }
function current_user_can( $c ) { return true; }
function get_page_by_path( $p ) { return (object) array( 'ID' => 957 ); }
function esc_html( $s ) { return htmlspecialchars( $s ); }
function wp_admin_notice( $m, $a ) { echo '[' . $a['type'] . '] ' . $m; }
function wp_slash( $v ) { return addslashes( $v ); }
function update_post_meta( $id, $k, $v ) { global $meta; $meta[ $id ][ $k ] = stripslashes( $v ); }
function delete_post_meta( $id, $k ) { global $meta; unset( $meta[ $id ][ $k ] ); }
function get_post_meta( $id, $k, $single ) { global $meta; return isset( $meta[ $id ][ $k ] ) ? $meta[ $id ][ $k ] : ''; }
function clean_post_cache( $id ) {}
function get_option( $k, $d = false ) { global $options; return array_key_exists( $k, $options ) ? $options[ $k ] : $d; }
function add_option( $k, $v, $x = '', $a = 'yes' ) { global $options; if ( ! array_key_exists( $k, $options ) ) { $options[ $k ] = $v; } }
function update_option( $k, $v, $a = null ) { global $options; $options[ $k ] = $v; }
function delete_option( $k ) { global $options; unset( $options[ $k ] ); }
function wp_remote_get( $url, $a ) { global $FILES, $fetched; $fetched[] = $url; $f = basename( parse_url( $url, PHP_URL_PATH ) ); return array( 'code' => 200, 'body' => $FILES[ $f ] ); }
function is_wp_error( $r ) { return false; }
function wp_remote_retrieve_response_code( $r ) { return $r['code']; }
function wp_remote_retrieve_body( $r ) { return $r['body']; }
function wp_rand() { return mt_rand(); }
function get_post_type( $id ) { return $id > 0 ? 'attachment' : false; }
function wp_get_attachment_url( $id ) { return "https://www.oc-jahorina.com/wp-content/uploads/x/$id.jpg"; }
function sanitize_text_field( $s ) { return trim( strip_tags( $s ) ); }
function wp_json_encode( $d ) { return json_encode( $d ); }
function get_post_field( $f, $id, $c ) { global $title; return $title[ $id ]; }
function current_time( $t ) { return '2026-10-21 12:00:00'; }
class JfgDb { public $posts = 'wp_posts'; function update( $t, $d, $w ) { global $title; $title[ $w['ID'] ] = $d['post_title']; } }
$wpdb = new JfgDb();

$old = array( '7pQYZeP2DFc', 'ag2t0kbQ94E', 'JbX0lYckAws', '_FS3hxNT_LE', 'kOlJQVRwrwY', 'ndaLqKm_ogg', 'T7tpfIE99es', 'atZBt4H14xY', '_HYLTOes3pQ', 'UwASyqLOglE' );
$vw  = function ( $id, $k ) { return array( 'id' => 'v' . $k, 'elType' => 'widget', 'settings' => array( 'youtube_url' => "https://www.youtube.com/watch?v=$id", 'video_type' => 'youtube', 'controls' => 'yes' ), 'elements' => array(), 'widgetType' => 'video' ); };
$col = function ( $id, $size, $els ) { return array( 'id' => $id, 'elType' => 'column', 'settings' => array( '_column_size' => $size, '_inline_size' => null ), 'elements' => $els, 'isInner' => false ); };
$doc = array(
	array( 'id' => 'a3a9f05', 'elType' => 'section', 'settings' => array(), 'elements' => array(
		$col( 'c6e2207', 50, array_map( $vw, array_slice( $old, 0, 5 ), range( 0, 4 ) ) ),
		$col( 'c2', 50, array_map( $vw, array_slice( $old, 5 ), range( 5, 9 ) ) ) ), 'isInner' => false ),
	array( 'id' => 's2', 'elType' => 'section', 'settings' => array(), 'elements' => array( $col( 'c3', 100, array() ) ), 'isInner' => false ) );
$orig = json_encode( $doc );
$meta[957]['_elementor_data'] = $orig;
$src = file_get_contents( "$DIR/wordpress-snippet.sablon.php" );
$src = str_replace( array( '__COMMIT__', '__SHA_VIDEI__', '__SHA_RED__' ), array( 'abc123', hash( 'sha256', $FILES['videi.json'] ), hash( 'sha256', $FILES['elementor-html-widget.html'] ) ), $src );
$fails = 0;
function ok( $c, $m ) { global $fails; if ( ! $c ) { $fails++; } echo ( $c ? '  ✓ ' : '  ✗ ' ) . $m . "\n"; }
function run( $src ) {
	global $hooks; $hooks = array();
	eval( $src );
	foreach ( $hooks['admin_init'] as $f ) { $f(); }
	ob_start(); foreach ( isset( $hooks['admin_notices'] ) ? $hooks['admin_notices'] : array() as $f ) { $f(); } return strip_tags( ob_get_clean() );
}
$want = json_decode( $FILES['videi.json'], true )['videi'];
echo "prvo pokretanje\n";
$out = run( $src );
echo '  poruka: ' . trim( $out ) . "\n";
$new = json_decode( $meta[957]['_elementor_data'], true );
ok( 1 === count( $new ) && 1 === count( $new[0]['elements'] ), 'jedna sekcija, jedna kolona (prazne uklonjene)' );
$c = $new[0]['elements'][0];
ok( 100 === $c['settings']['_column_size'] && ! array_key_exists( '_inline_size', $c['settings'] ), 'kolona 100%' );
$w = $c['elements'];
ok( 'html' === $w[0]['widgetType'] && false !== strpos( $w[0]['settings']['html'], 'id="jvg-galerija"' ), 'prvi je HTML widget galerije' );
$ids = array(); foreach ( array_slice( $w, 1 ) as $x ) { $ids[] = $x['widgetType'] . ':' . substr( $x['settings']['youtube_url'], -11 ) . ':' . $x['settings']['controls']; }
ok( $ids === array_map( function ( $v ) { return "video:$v:yes"; }, $want ), 'Video widgeti tačno sa spiska, ovim redoslijedom, postavke zadržane' );
$all = array(); foreach ( $w as $x ) { $all[] = $x['id']; } ok( count( array_unique( $all ) ) === count( $all ) && ! in_array( 'v0', $all, true ), 'novi jedinstveni ID-evi' );
ok( $options['jvg_rezerva_elementor'] === $orig && false !== strpos( $out, 'urađeno' ), 'rezerva = original, poruka o uspjehu' );
ok( '[:SH]Video galerija[:en]Video Gallery[:]' === $title[957], 'EN naslov: ' . $title[957] );
echo "drugo pokretanje\n";
$before = $meta; $fetched = array(); $out = run( $src );
ok( $before === $meta && ! $fetched && '' === trim( $out ), 'bez promjena' );
echo "pogrešan SHA\n";
$m2 = $meta; $o2 = $options; $options = array(); $meta[957]['_elementor_data'] = $orig;
$out = run( str_replace( hash( 'sha256', $FILES['videi.json'] ), str_repeat( '0', 64 ), $src ) );
ok( $meta[957]['_elementor_data'] === $orig && false !== strpos( $out, 'nisu stigli' ), 'stranica nije mijenjana' );
$meta = $m2; $options = $o2;
echo "vraćanje\n";
$out = run( str_replace( '$jvg_vrati  = false;', '$jvg_vrati  = true;', $src ) );
ok( $meta[957]['_elementor_data'] === $orig && false !== strpos( $out, 'vraćena' ), 'stranica vraćena na original' );
echo $fails ? "\nNEUSPJELO: $fails\n" : "\nSVE OK\n";
exit( $fails ? 1 : 0 );
