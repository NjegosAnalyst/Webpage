/* Jahorina — Foto galerija: JEDNOKRATNO preuređenje stranice /foto-galerija/
   WPCode → Add Snippet → PHP Snippet; Insertion: Auto Insert, Run Everywhere; Activate + Save.
   Radi kad administrator otvori bilo koju stranicu admin panela (npr. Kontrolna tabla), jednom:
   1) sačuva rezervnu kopiju Elementor sadržaja stranice,
   2) Basic Gallery podijeli u 5 albuma (Naslov H2 + Basic Gallery), a na vrh doda HTML widget galerije,
   3) upiše alt tekstove (SR + EN) fotografijama koje ga nemaju (postojeći alt se ne dira),
   4) EN naslov „Photo gallery“ → „Photo Gallery“.
   Podaci se čitaju sa GitHuba (commit __COMMIT__), provjereni SHA-256.
   Ako su albumi obrisani sa stranice, napravi ih ponovo iz rezervne kopije (verzija 2).
   Kad se pojavi zelena poruka „Foto galerija: urađeno“, snippet DEAKTIVIRAJ.
   Vraćanje stranice na staro: $jfg_vrati = true; → Save → otvori admin → deaktiviraj. */
$jfg_vrati  = false;
$jfg_commit = '__COMMIT__';
$jfg_sha    = array(
	'albumi' => '__SHA_ALBUMI__',
	'red'    => '__SHA_RED__',
);

add_action( 'admin_init', function () use ( $jfg_vrati, $jfg_commit, $jfg_sha ) {
	if ( wp_doing_ajax() || ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$page = get_page_by_path( 'foto-galerija' );
	$pid  = $page ? (int) $page->ID : 935;
	$msg  = function ( $text, $ok = true ) {
		add_action( 'admin_notices', function () use ( $text, $ok ) {   // bez HTML-a u kodu (firewall hostinga)
			if ( function_exists( 'wp_admin_notice' ) ) {
				wp_admin_notice( esc_html( 'Foto galerija: ' . $text ), array( 'type' => $ok ? 'success' : 'error' ) );
			} else {
				echo esc_html( 'Foto galerija: ' . $text );
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
	if ( $jfg_vrati ) {
		$old = get_option( 'jfg_rezerva_elementor' );
		if ( ! $old ) {
			$msg( 'nema rezervne kopije — ništa nije mijenjano.', false );
		} elseif ( false === strpos( $json, 'jfg-galerija' ) ) {
			$msg( 'stranica je već vraćena na staro. Snippet deaktiviraj.' );
		} else {
			$save( $old );
			delete_option( 'jfg_galerija_v2' );
			$msg( 'stranica vraćena na staro (jedna galerija). Snippet deaktiviraj.' );
		}
		return;
	}
	if ( get_option( 'jfg_galerija_v2' ) ) {
		return;
	}

	/* podaci sa GitHuba (zaključano na commit), provjera SHA-256 */
	$get = function ( $file, $sha ) use ( $jfg_commit ) {
		$bases = array(
			'https://cdn.jsdelivr.net/gh/NjegosAnalyst/Webpage@' . $jfg_commit . '/jahorina-foto-galerija/',
			'https://raw.githubusercontent.com/NjegosAnalyst/Webpage/' . $jfg_commit . '/jahorina-foto-galerija/',
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
	$data = json_decode( (string) $get( 'albumi.json', $jfg_sha['albumi'] ), true );
	$line = $get( 'elementor-html-widget.html', $jfg_sha['red'] );
	if ( empty( $data['albumi'] ) || empty( $data['alt'] ) || ! $line ) {
		$msg( 'podaci sa GitHuba nisu stigli. Osvježi ovu stranicu za minut; ako se ponovi, javi.', false );
		return;
	}
	$done    = array();
	$page_ok = false;   // dok stranica nije preuređena, snippet pokušava ponovo pri svakom otvaranju admina

	/* 1–2) stranica: Basic Gallery → HTML widget + albumi (Naslov H2 + Basic Gallery) */
	// ako su albumi (Basic Gallery widgeti) obrisani sa stranice, kreće se od rezervne kopije (originalna galerija)
	$has_gal = false !== strpos( $json, '"image-gallery"' );
	if ( ! $has_gal && get_option( 'jfg_rezerva_elementor' ) ) {
		$json = (string) get_option( 'jfg_rezerva_elementor' );
	}
	$doc = json_decode( $json, true );
	if ( $has_gal && false !== strpos( $json, 'jfg-galerija' ) ) {
		$done[]  = 'stranica je već preuređena';
		$page_ok = true;
	} elseif ( ! is_array( $doc ) ) {
		$msg( 'Elementor sadržaj stranice nije pronađen (ID ' . $pid . ') — stranica nije mijenjana.', false );
	} else {
		$new_id = function () {
			return substr( md5( uniqid( '', true ) . wp_rand() ), 0, 7 );
		};
		$albums = 0;
		$make   = function ( $el ) use ( $data, $line, $new_id, &$albums ) {
			$have = array();
			foreach ( (array) ( isset( $el['settings']['wp_gallery'] ) ? $el['settings']['wp_gallery'] : array() ) as $it ) {
				if ( ! empty( $it['id'] ) ) {
					$have[ (int) $it['id'] ] = $it;
				}
			}
			$out  = array( array( 'id' => $new_id(), 'elType' => 'widget', 'widgetType' => 'html', 'settings' => array( 'html' => $line ), 'elements' => array() ) );
			$used = array();
			$add  = function ( $sr, $en, $ids ) use ( &$out, &$albums, $el, $have, $new_id ) {
				$items = array();
				foreach ( $ids as $x ) {
					$items[] = isset( $have[ $x ] ) ? $have[ $x ] : array( 'id' => $x, 'url' => wp_get_attachment_url( $x ) );
				}
				if ( ! $items ) {
					return;
				}
				$out[] = array( 'id' => $new_id(), 'elType' => 'widget', 'widgetType' => 'heading', 'settings' => array( 'title' => '[:SH]' . $sr . '[:en]' . $en . '[:]', 'header_size' => 'h2' ), 'elements' => array() );
				$g                         = $el;
				$g['id']                   = $new_id();
				$g['settings']['wp_gallery'] = $items;
				$out[]                     = $g;
				$albums++;
			};
			foreach ( $data['albumi'] as $al ) {
				$ids = array();
				foreach ( $al['ids'] as $x ) {
					$x = (int) $x;
					if ( 'attachment' === get_post_type( $x ) ) {
						$ids[]      = $x;
						$used[ $x ] = 1;
					}
				}
				$add( $al['sr'], $al['en'], $ids );
			}
			$rest = array_values( array_diff( array_keys( $have ), array_keys( $used ) ) );   // dodate poslije prijedloga
			if ( $rest ) {
				$add( 'Ostale fotografije', 'More photos', $rest );
			}
			return $out;
		};
		$walk = function ( &$els ) use ( &$walk, $make ) {
			foreach ( $els as $i => $el ) {
				if ( isset( $el['widgetType'] ) && 'image-gallery' === $el['widgetType'] ) {
					array_splice( $els, $i, 1, $make( $el ) );
					return true;
				}
				if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) && $walk( $els[ $i ]['elements'] ) ) {
					return true;
				}
			}
			return false;
		};
		if ( ! $walk( $doc ) ) {
			$msg( 'na stranici nema Basic Gallery widgeta — stranica nije mijenjana.', false );
		} else {
			if ( false === get_option( 'jfg_rezerva_elementor' ) ) {
				add_option( 'jfg_rezerva_elementor', $json, '', 'no' );
			}
			$save( wp_json_encode( $doc ) );
			$done[]  = $albums . ' albuma';
			$page_ok = true;
		}
	}

	/* 3) alt tekstovi (SR + EN, qTranslate-XT) samo gdje ih nema */
	$n = 0;
	foreach ( $data['alt'] as $x => $t ) {
		$x = (int) $x;
		if ( 'attachment' !== get_post_type( $x ) || '' !== trim( (string) get_post_meta( $x, '_wp_attachment_image_alt', true ) ) ) {
			continue;
		}
		update_post_meta( $x, '_wp_attachment_image_alt', wp_slash( '[:SH]' . sanitize_text_field( $t[0] ) . '[:en]' . sanitize_text_field( $t[1] ) . '[:]' ) );
		$n++;
	}
	$done[] = $n . ' alt tekstova';

	/* 4) EN naslov stranice */
	$title = (string) get_post_field( 'post_title', $pid, 'raw' );
	if ( false !== strpos( $title, 'Photo gallery' ) ) {
		global $wpdb;
		$wpdb->update( $wpdb->posts, array( 'post_title' => str_replace( 'Photo gallery', 'Photo Gallery', $title ) ), array( 'ID' => $pid ) );
		clean_post_cache( $pid );
		$done[] = 'EN naslov „Photo Gallery“';
	}

	if ( $page_ok ) {
		update_option( 'jfg_galerija_v2', current_time( 'mysql' ), false );
		$msg( 'urađeno — ' . implode( ', ', $done ) . '. Snippet sada deaktiviraj, pa otvori stranicu Foto galerija.' );
	}
} );
