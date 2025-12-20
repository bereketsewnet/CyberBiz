<?php

namespace App\Helpers;

class ProductDescriptionHelper
{
    /**
     * Generate HTML template from plain text description
     * Takes plain text input and wraps it in a structured HTML template
     */
    public static function generateFromPlainText(string $plainText): string
    {
        // Split by double newlines to identify paragraphs
        $paragraphs = preg_split('/\n\s*\n/', trim($plainText));
        
        $html = '<div class="product-description">';
        
        foreach ($paragraphs as $index => $paragraph) {
            $paragraph = trim($paragraph);
            if (empty($paragraph)) {
                continue;
            }
            
            // Check if paragraph looks like a heading (starts with # or is short and uppercase)
            if (preg_match('/^#+\s*(.+)$/', $paragraph, $matches)) {
                $level = substr_count($paragraph, '#');
                $text = trim($matches[1]);
                $html .= "<h{$level}>{$text}</h{$level}>";
            } elseif (preg_match('/^([A-Z][A-Z\s]+)$/u', $paragraph) && strlen($paragraph) < 100) {
                // Looks like a heading (all caps, short)
                $html .= "<h2>{$paragraph}</h2>";
            } elseif (preg_match('/^([A-Z][^:]+):$/', $paragraph, $matches)) {
                // Looks like a section header (e.g., "Course Content:")
                $html .= "<h3>{$paragraph}</h3>";
            } elseif (preg_match('/^[-•*]\s*(.+)$/m', $paragraph)) {
                // Looks like a list (starts with bullet points)
                $html .= '<ul>';
                $lines = explode("\n", $paragraph);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (empty($line)) continue;
                    // Remove bullet markers
                    $line = preg_replace('/^[-•*]\s*/', '', $line);
                    $html .= "<li>{$line}</li>";
                }
                $html .= '</ul>';
            } else {
                // Regular paragraph
                $html .= "<p>{$paragraph}</p>";
            }
        }
        
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Create default HTML template structure for products
     */
    public static function createDefaultTemplate(): string
    {
        $html = '<div class="product-description">';
        $html .= '<h2>Overview</h2>';
        $html .= '<p>This course/book provides comprehensive training on the subject...</p>';
        $html .= '<h3>What You\'ll Learn:</h3>';
        $html .= '<ul>';
        $html .= '<li>Key concept 1</li>';
        $html .= '<li>Key concept 2</li>';
        $html .= '<li>Key concept 3</li>';
        $html .= '</ul>';
        $html .= '<h3>Requirements:</h3>';
        $html .= '<ul>';
        $html .= '<li>Basic understanding required</li>';
        $html .= '<li>Access to necessary tools/software</li>';
        $html .= '</ul>';
        $html .= '</div>';
        
        return $html;
    }
}

