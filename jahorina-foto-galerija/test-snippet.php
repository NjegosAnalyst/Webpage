<?php
// Test jednokratnog snippeta bez WordPressa: lažne WP funkcije + Elementor sadržaj kao na sajtu
// (sekcija → kolona → jedan Basic Gallery sa 62 fotografije + jedna dodata poslije prijedloga).
// Pokretanje: php test-snippet.php   (red widgeta pravi napravi-widget.py --proba)
$DIR   = __DIR__;
$FILES = array(
	'albumi.json'                => file_get_contents( "$DIR/albumi.json" ),
	'elementor-html-widget.html' => shell_exec( 'python3 ' . escapeshellarg( "$DIR/napravi-widget.py" ) . ' --proba' ),
);
$meta = array(); $options = array(); $hooks = array(); $title = array( 935 => '[:SH]Foto galerija[:en]Photo gallery[:]' ); $fetched = array();

function add_action( $h, $f ) { global $hooks; $hooks[ $h ][] = $f; }
function wp_doing_ajax() { return false; }
function current_user_can( $c ) { return true; }
function get_page_by_path( $p ) { return (object) array( 'ID' => 935 ); }
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

// Elementor sadržaj kao na sajtu: redoslijed fotografija iz galerije na /foto-galerija/
$site = array( 31287, 31423, 28936, 31421, 31415, 31414, 31418, 31255, 31420, 31417, 31419, 31424, 31292, 31291, 31290, 31289, 31288, 31286, 31285, 31284, 31283, 31282, 31281, 31280, 31279, 29844, 31277, 31276, 31275, 31274, 29837, 31272, 31270, 31265, 31266, 29839, 31268, 31264, 31422, 29562, 31273, 31259, 31254, 31252, 29866, 31250, 29843, 29836, 29835, 29838, 29544, 29847, 29842, 29832, 29840, 29833, 31300, 28935, 31301, 31302, 31303, 31304, 40001 );
$gal  = array_map( function ( $id ) { return array( 'id' => $id, 'url' => "https://www.oc-jahorina.com/wp-content/uploads/x/$id.jpg" ); }, $site );
$doc  = array( array( 'id' => '2e43e20', 'elType' => 'section', 'settings' => array(), 'elements' => array( array( 'id' => '6422727', 'elType' => 'column', 'settings' => array( '_column_size' => 100 ),
	'elements' => array( array( 'id' => '3fd24e2', 'elType' => 'widget', 'settings' => array( 'wp_gallery' => $gal, 'thumbnail_size' => 'thumbnail', 'gallery_columns' => '8' ), 'elements' => array(), 'widgetType' => 'image-gallery' ) ), 'isInner' => false ) ), 'isInner' => false ) );
$orig = json_encode( $doc );
$meta[935]['_elementor_data'] = $orig;
$meta[31287]['_wp_attachment_image_alt'] = 'Postojeći alt';   // postojeći alt se ne dira

$src = file_get_contents( "$DIR/wordpress-snippet.sablon.php" );
$src = str_replace( array( '__COMMIT__', '__SHA_ALBUMI__', '__SHA_RED__' ), array( 'abc123', hash( 'sha256', $FILES['albumi.json'] ), hash( 'sha256', $FILES['elementor-html-widget.html'] ) ), $src );
$fails = 0;
function ok( $c, $m ) { global $fails; if ( ! $c ) { $fails++; } echo ( $c ? '  ✓ ' : '  ✗ ' ) . $m . "\n"; }
function run( $src ) {
	global $hooks; $hooks = array();
	eval( $src );   // WPCode izvršava PHP snippet na isti način
	foreach ( $hooks['admin_init'] as $f ) { $f(); }
	ob_start(); foreach ( isset( $hooks['admin_notices'] ) ? $hooks['admin_notices'] : array() as $f ) { $f(); } return strip_tags( ob_get_clean() );
}

echo "prvo pokretanje\n";
$out = run( $src );
echo '  poruka: ' . trim( $out ) . "\n";
$new  = json_decode( $meta[935]['_elementor_data'], true );
$col  = $new[0]['elements'][0]['elements'];
$data = json_decode( $FILES['albumi.json'], true );
ok( count( $col ) === 1 + 2 * 6, 'kolona: HTML widget + 6 × (Naslov + Basic Gallery) = ' . count( $col ) );
ok( 'html' === $col[0]['widgetType'] && false !== strpos( $col[0]['settings']['html'], 'id="jfg-galerija"' ), 'prvi je HTML widget sa galerijom' );
foreach ( $data['albumi'] as $k => $al ) {
	$h = $col[ 1 + 2 * $k ]; $g = $col[ 2 + 2 * $k ];
	$ids = array_map( function ( $it ) { return $it['id']; }, $g['settings']['wp_gallery'] );
	ok( 'heading' === $h['widgetType'] && $h['settings']['title'] === '[:SH]' . $al['sr'] . '[:en]' . $al['en'] . '[:]' && 'h2' === $h['settings']['header_size']
		&& 'image-gallery' === $g['widgetType'] && $ids === $al['ids'] && '8' === $g['settings']['gallery_columns'] && $g['id'] !== '3fd24e2',
		$al['sr'] . ': ' . count( $ids ) . ' fotografija, postavke galerije zadržane' );
}
ok( 'Ostale fotografije' === explode( '[:en]', substr( $col[11]['settings']['title'], 5 ) )[0] && array( 40001 ) === array_map( function ( $it ) { return $it['id']; }, $col[12]['settings']['wp_gallery'] ), 'fotografija van prijedloga ide u „Ostale fotografije“' );
$all = array(); foreach ( $col as $e ) { $all[] = $e['id']; } ok( count( array_unique( $all ) ) === count( $all ), 'svi Elementor ID-evi jedinstveni' );
ok( $options['jfg_rezerva_elementor'] === $orig, 'rezervna kopija = originalni sadržaj' );
$alts = 0; foreach ( $data['alt'] as $id => $t ) { if ( isset( $meta[ $id ]['_wp_attachment_image_alt'] ) && 0 === strpos( $meta[ $id ]['_wp_attachment_image_alt'], '[:SH]' ) ) { $alts++; } }
ok( 61 === $alts && 'Postojeći alt' === $meta[31287]['_wp_attachment_image_alt'], 'alt upisan za 61, postojeći alt ostao: ' . $alts );
ok( '[:SH]Foto galerija[:en]Photo Gallery[:]' === $title[935], 'EN naslov: ' . $title[935] );
ok( false !== strpos( $out, 'urađeno' ) && false !== strpos( $out, '6 albuma' ), 'poruka o uspjehu' );
ok( 2 === count( $fetched ) && false !== strpos( $fetched[0], 'cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@abc123/' ), 'podaci sa jsDelivr-a, zaključano na commit' );

echo "drugo pokretanje (ništa se ne mijenja)\n";
$before = $meta; $fetched = array();
$out = run( $src );
ok( $before === $meta && ! $fetched && '' === trim( $out ), 'bez promjena, bez preuzimanja, bez poruke' );

echo "pogrešan SHA (podmetnut fajl)\n";
$m2 = $meta; $o2 = $options; $options = array(); $meta[935]['_elementor_data'] = $orig;
$out = run( str_replace( hash( 'sha256', $FILES['albumi.json'] ), str_repeat( '0', 64 ), $src ) );
ok( $meta[935]['_elementor_data'] === $orig && false !== strpos( $out, 'nisu stigli' ) && ! isset( $options['jfg_galerija_v1'] ), 'stranica nije mijenjana, poruka o grešci, pokušaće ponovo' );
$meta = $m2; $options = $o2;

echo "vraćanje na staro\n";
$out = run( str_replace( '$jfg_vrati  = false;', '$jfg_vrati  = true;', $src ) );
ok( $meta[935]['_elementor_data'] === $orig && false !== strpos( $out, 'vraćena' ) && ! isset( $options['jfg_galerija_v1'] ), 'stranica vraćena na original' );

echo $fails ? "\nNEUSPJELO: $fails\n" : "\nSVE OK\n";
exit( $fails ? 1 : 0 );
