/* Jahorina — Video galerija: JEDNOKRATNO preuređenje stranice /video-galerija/
   WPCode → Add Snippet → PHP Snippet; Insertion: Auto Insert, Run Everywhere; Activate + Save.
   Radi kad administrator otvori bilo koju stranicu admin panela, jednom:
   1) sačuva rezervnu kopiju Elementor sadržaja stranice,
   2) na mjesto Video widgeta stavi HTML widget galerije + Video widgete sa spiska (videi.json),
      ovim redoslijedom (prvi je istaknut); prazne kolone i sekcije ukloni,
   3) EN naslov „Video gallery“ → „Video Gallery“.
   Podaci se čitaju sa GitHuba (commit __COMMIT__), provjereni SHA-256.
   Kad se pojavi zelena poruka „Video galerija: urađeno“, snippet DEAKTIVIRAJ (pa obriši).
   Vraćanje stranice na staro: $jvg_vrati = true; → Save → otvori admin → deaktiviraj. */
$jvg_vrati  = false;
$jvg_commit = '__COMMIT__';
$jvg_sha    = array(
	'videi' => '__SHA_VIDEI__',
	'red'   => '__SHA_RED__',
);

add_action( 'admin_init', function () use ( $jvg_vrati, $jvg_commit, $jvg_sha ) {
	if ( wp_doing_ajax() || ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$page = get_page_by_path( 'video-galerija' );
	$pid  = $page ? (int) $page->ID : 957;
	$msg  = function ( $text, $ok = true ) {
		add_action( 'admin_notices', function () use ( $text, $ok ) {   // bez HTML-a u kodu (firewall hostinga)
			if ( function_exists( 'wp_admin_notice' ) ) {
				wp_admin_notice( esc_html( 'Video galerija: ' . $text ), array( 'type' => $ok ? 'success' : 'error' ) );
			} else {
				echo esc_html( 'Video galerija: ' . $text );
			}
		} );
	};
	$save = function ( $json ) use ( $pid ) {
		update_post_meta( $pid, '_elementor_data', wp_slash( $json ) );
		delete_post_meta( $pid, '_elementor_css' );
		delete_post_meta( $pid, '_elementor_element_cache' );
		delete_post_meta( $pid, '_elementor_page_assets' );
		if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->files_manager ) ) {
			\Elementor\Plugin::$instance->files_manager->clear_cache();
		}
		if ( function_exists( 'wpfc_clear_all_cache' ) ) {
			wpfc_clear_all_cache( true );
		}
		clean_post_cache( $pid );
	};
	$json = (string) get_post_meta( $pid, '_elementor_data', true );

	/* vraćanje na staro */
	if ( $jvg_vrati ) {
		$old = get_option( 'jvg_rezerva_elementor' );
		if ( ! $old ) {
			$msg( 'nema rezervne kopije — ništa nije mijenjano.', false );
		} elseif ( false === strpos( $json, 'jvg-galerija' ) ) {
			$msg( 'stranica je već vraćena na staro. Snippet deaktiviraj.' );
		} else {
			$save( $old );
			delete_option( 'jvg_galerija_v1' );
			$msg( 'stranica vraćena na staro. Snippet deaktiviraj.' );
		}
		return;
	}
	if ( get_option( 'jvg_galerija_v1' ) ) {
		return;
	}

	/* podaci sa GitHuba (zaključano na commit), provjera SHA-256 */
	$get = function ( $file, $sha ) use ( $jvg_commit ) {
		$bases = array(
			'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@' . $jvg_commit . '/jahorina-video-galerija/',
			'https://raw.githubusercontent.com/NjegosAnalyst/Webpage/' . $jvg_commit . '/jahorina-video-galerija/',
		);
		foreach ( $bases as $base ) {
			$r = wp_remote_get( $base . $file, array( 'timeout' => 20 ) );
			if ( is_wp_error( $r ) || 200 !== (int) wp_remote_retrieve_response_code( $r ) ) {
				continue;
			}
			$body = wp_remote_retrieve_body( $r );
			if ( hash_equals( $sha, hash( 'sha256', $body ) ) ) {
				return $body;
			}
		}
		return null;
	};
	$data = json_decode( (string) $get( 'videi.json', $jvg_sha['videi'] ), true );
	$line = $get( 'elementor-html-widget.html', $jvg_sha['red'] );
	if ( empty( $data['videi'] ) || ! $line ) {
		$msg( 'podaci sa GitHuba nisu stigli. Osvježi ovu stranicu za minut; ako se ponovi, javi.', false );
		return;
	}
	if ( false !== strpos( $json, 'jvg-galerija' ) ) {
		update_option( 'jvg_galerija_v1', current_time( 'mysql' ), false );
		$msg( 'stranica je već preuređena. Snippet deaktiviraj.' );
		return;
	}
	$doc = json_decode( $json, true );
	if ( ! is_array( $doc ) ) {
		$msg( 'Elementor sadržaj stranice nije pronađen (ID ' . $pid . ') — stranica nije mijenjana.', false );
		return;
	}

	$new_id = function () {
		return substr( md5( uniqid( '', true ) . wp_rand() ), 0, 7 );
	};
	/* novi widgeti: HTML widget galerije + Video widget za svaki video (postavke kao u prvom postojećem) */
	$make = function ( $tpl ) use ( $data, $line, $new_id ) {
		$out = array( array( 'id' => $new_id(), 'elType' => 'widget', 'widgetType' => 'html', 'settings' => array( 'html' => $line ), 'elements' => array() ) );
		foreach ( $data['videi'] as $v ) {
			if ( ! preg_match( '/^[A-Za-z0-9_-]{11}$/', (string) $v ) ) {
				continue;
			}
			$w                            = $tpl;
			$w['id']                      = $new_id();
			$w['settings']['youtube_url'] = 'https://www.youtube.com/watch?v=' . $v;
			$w['settings']['video_type']  = 'youtube';
			$out[]                        = $w;
		}
		return $out;
	};
	/* prvi Video widget → novi widgeti; ostali Video widgeti se uklone */
	$placed = false;
	$walk   = function ( &$els ) use ( &$walk, &$placed, $make ) {
		$res = array();
		foreach ( $els as $el ) {
			if ( isset( $el['widgetType'] ) && 'video' === $el['widgetType'] ) {
				if ( ! $placed ) {
					$placed = true;
					foreach ( $make( $el ) as $x ) {
						$res[] = $x;
					}
				}
				continue;
			}
			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				$walk( $el['elements'] );
			}
			$res[] = $el;
		}
		$els = $res;
	};
	$walk( $doc );
	if ( ! $placed ) {
		$msg( 'na stranici nema Video widgeta — stranica nije mijenjana.', false );
		return;
	}
	/* prazne kolone i sekcije van; sekcija sa jednom kolonom → kolona 100% */
	$tidy = array();
	foreach ( $doc as $sec ) {
		if ( isset( $sec['elType'] ) && 'section' === $sec['elType'] && is_array( $sec['elements'] ) ) {
			$cols = array_values( array_filter( $sec['elements'], function ( $c ) {
				return ! empty( $c['elements'] );
			} ) );
			if ( ! $cols ) {
				continue;
			}
			if ( 1 === count( $cols ) && count( $sec['elements'] ) > 1 ) {
				$cols[0]['settings']['_column_size'] = 100;
				unset( $cols[0]['settings']['_inline_size'] );
			}
			$sec['elements'] = $cols;
		} elseif ( isset( $sec['elType'] ) && 'container' === $sec['elType'] && empty( $sec['elements'] ) ) {
			continue;
		}
		$tidy[] = $sec;
	}
	if ( false === get_option( 'jvg_rezerva_elementor' ) ) {
		add_option( 'jvg_rezerva_elementor', $json, '', 'no' );
	}
	$save( wp_json_encode( $tidy ) );
	/* EN naslov stranice */
	$title = (string) get_post_field( 'post_title', $pid, 'raw' );
	if ( false !== strpos( $title, 'Video gallery' ) ) {
		global $wpdb;
		$wpdb->update( $wpdb->posts, array( 'post_title' => str_replace( 'Video gallery', 'Video Gallery', $title ) ), array( 'ID' => $pid ) );
		clean_post_cache( $pid );
	}
	update_option( 'jvg_galerija_v1', current_time( 'mysql' ), false );
	$msg( 'urađeno — ' . count( $data['videi'] ) . ' videa na stranici. Snippet sada deaktiviraj (i obriši), pa otvori stranicu Video galerija.' );
} );
