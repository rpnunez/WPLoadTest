<?php
/**
 * Plugin Name: StressPulse Pro
 * Description: Enterprise-grade performance stress testing and telemetry for WordPress plugins.
 * Version: 1.0.0
 * Author: StressPulse Team
 * Text Domain: stresspulse-pro
 */

if (!defined('ABSPATH')) exit;

class StressPulsePro {
    private static $instance = null;
    private $post_type = 'wp_stress_test';

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_action('init', [$this, 'register_cpt']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('wp_ajax_sp_start_test', [$this, 'ajax_start_test']);
        
        // Performance hooking
        if (is_admin() && isset($_GET['sp_monitor'])) {
            add_action('init', [$this, 'start_telemetry'], 1);
        }
    }

    /**
     * Register the Custom Post Type for results
     */
    public function register_cpt() {
        register_post_type($this->post_type, [
            'labels' => [
                'name' => __('Stress Tests', 'stresspulse-pro'),
                'singular_name' => __('Stress Test', 'stresspulse-pro'),
            ],
            'public' => false,
            'show_ui' => true,
            'capability_type' => 'post',
            'hierarchical' => false,
            'menu_icon' => 'dashicons-performance',
            'supports' => ['title']
        ]);
    }

    /**
     * Add admin dashboard menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('StressPulse Pro', 'stresspulse-pro'),
            __('StressPulse', 'stresspulse-pro'),
            'manage_options',
            'stresspulse-pro',
            [$this, 'render_admin_page'],
            'dashicons-performance'
        );
    }

    /**
     * Render the main dashboard (connecting to our React app)
     */
    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('StressPulse Pro Performance Lab', 'stresspulse-pro'); ?></h1>
            <p><?php _e('Select an active plugin to begin synthetic load simulation.', 'stresspulse-pro'); ?></p>
            
            <div id="sp-plugin-selector" style="margin-top: 20px; padding: 20px; background: #fff; border: 1px solid #ccd0d4; border-radius: 4px;">
                <label style="font-weight: bold; display: block; margin-bottom: 10px;"><?php _e('Target Plugin:', 'stresspulse-pro'); ?></label>
                <select id="sp-target-plugin" style="min-width: 300px;">
                    <option value=""><?php _e('-- Select Active Plugin --', 'stresspulse-pro'); ?></option>
                    <?php
                    $active_plugins = get_option('active_plugins');
                    $all_plugins = get_plugins();
                    foreach ($active_plugins as $plugin_path) {
                        $plugin_data = $all_plugins[$plugin_path];
                        printf('<option value="%s">%s (v%s)</option>', 
                            esc_attr(dirname($plugin_path)), 
                            esc_html($plugin_data['Name']),
                            esc_html($plugin_data['Version'])
                        );
                    }
                    ?>
                </select>
                <button id="sp-launch-btn" class="button button-primary" style="margin-left: 10px;"><?php _e('Launch Analysis Lab', 'stresspulse-pro'); ?></button>
            </div>

            <div id="sp-app-container" style="margin-top: 20px; height: 800px; border: 1px solid #ccd0d4; border-radius: 4px; overflow: hidden;">
                <iframe 
                    id="sp-iframe"
                    src="https://cloud.run.your-app-url.com" 
                    style="width: 100%; height: 100%; border: none;"
                ></iframe>
            </div>

            <script>
                document.getElementById('sp-launch-btn').addEventListener('click', function() {
                    var slug = document.getElementById('sp-target-plugin').value;
                    if (!slug) return alert('Please select a plugin first');
                    var iframe = document.getElementById('sp-iframe');
                    iframe.src = iframe.src.split('?')[0] + '?plugin=' + slug;
                });
            </script>
        </div>
        <?php
    }

    /**
     * Telemetry capture implementation
     */
    public function start_telemetry() {
        global $wpdb, $sp_metrics;
        $sp_metrics = [
            'queries' => 0,
            'mem_start' => memory_get_usage(),
            'time_start' => microtime(true)
        ];

        add_filter('query', function($query) {
            global $sp_metrics;
            $sp_metrics['queries']++;
            return $query;
        });

        register_shutdown_function([$this, 'save_telemetry']);
    }

    public function save_telemetry() {
        global $sp_metrics;
        if (!isset($sp_metrics)) return;

        $duration = (microtime(true) - $sp_metrics['time_start']) * 1000;
        $mem_used = (memory_get_usage() - $sp_metrics['mem_start']) / 1024 / 1024;

        // Persistent storage using WPDB via CPT
        $post_id = wp_insert_post([
            'post_title' => 'Pulse Data - ' . date('Y-m-d H:i:s'),
            'post_type' => $this->post_type,
            'post_status' => 'publish'
        ]);

        if ($post_id) {
            update_post_meta($post_id, '_sp_latency', $duration);
            update_post_meta($post_id, '_sp_queries', $sp_metrics['queries']);
            update_post_meta($post_id, '_sp_memory', $mem_used);
        }
    }
}

// Initialize the plugin
StressPulsePro::get_instance();
