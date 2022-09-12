<?php
/**
 * Plugin Name:       Slideshow Plugin
 * Description:       WordPress Engineer - Front End Assignment for rtCamp.
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Author:            Andrius Gliozeris
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       slideshow-plugin
 */

function create_block_slideshow_plugin_block_init() {
	$siteUrl = get_site_url();
	$siteUrl .= '/wp-json/';
	register_block_type(  __DIR__ . '/build', [
		'attributes'      => [
			// get site's url to get the json end point by default
			'siteUrl' => [
				'default' => $siteUrl,
				'type'    => 'string'
			],
			'apiUrl' => [
				'default' => $siteUrl,
				'type'    => 'string'
			],
			// posts to show
			'postsCount' => [
				'default' => 5,
				'type'    => 'int'
			],
			'selectedCategory' => [
				'default' => '',
				'type'    => 'int'
			],
			'featured' => [
				'default' => false,
				'type'    => 'boolean'
			],
			// styling of text and button
			'headlineColor' => [
				'default' => '#FFF',
				'type'    => 'string'
			],
			'textColor' => [
				'default' => '#FFF',
				'type'    => 'string'
			],
			// slider's style
			'arrows' => [
				'default' => false,
				'type'    => 'boolean'
			],
			'dots' => [
				'default' => false,
				'type'    => 'boolean'
			],
			'posts' => [
				'type' => 'array'
			],
		]
	] );	
}
add_action( 'init', 'create_block_slideshow_plugin_block_init' );

function block_enqueue_script()
{   
    wp_enqueue_script( 'slide-js', plugin_dir_url( __FILE__ ) . 'build/scripts/slide.js' );
}
add_action('wp_enqueue_scripts', 'block_enqueue_script');