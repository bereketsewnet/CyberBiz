<?php

namespace App\Helpers;

class JobDescriptionHelper
{
    /**
     * Generate HTML template from plain text description
     * Takes plain text input and wraps it in a structured HTML template
     */
    public static function generateFromPlainText(string $plainText): string
    {
        // Split by double newlines to identify paragraphs
        $paragraphs = preg_split('/\n\s*\n/', trim($plainText));
        
        $html = '<div class="job-description">';
        
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
                // Looks like a section header (e.g., "Requirements:")
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
     * Create default HTML template structure
     */
    public static function createDefaultTemplate(
        string $aboutRole = '',
        string $requirements = '',
        string $benefits = ''
    ): string {
        $html = '<div class="job-description">';
        
        if (!empty($aboutRole)) {
            $html .= '<h2>Job Description</h2>';
            $html .= '<p>' . nl2br(htmlspecialchars($aboutRole)) . '</p>';
        }
        
        if (!empty($requirements)) {
            $html .= '<h3>Requirements:</h3>';
            $html .= '<ul>';
            $reqLines = explode("\n", $requirements);
            foreach ($reqLines as $line) {
                $line = trim($line);
                if (!empty($line)) {
                    // Remove bullet markers if present
                    $line = preg_replace('/^[-•*]\s*/', '', $line);
                    $html .= '<li>' . htmlspecialchars($line) . '</li>';
                }
            }
            $html .= '</ul>';
        }
        
        if (!empty($benefits)) {
            $html .= '<h3>Benefits:</h3>';
            $html .= '<ul>';
            $benLines = explode("\n", $benefits);
            foreach ($benLines as $line) {
                $line = trim($line);
                if (!empty($line)) {
                    $line = preg_replace('/^[-•*]\s*/', '', $line);
                    $html .= '<li>' . htmlspecialchars($line) . '</li>';
                }
            }
            $html .= '</ul>';
        }
        
        $html .= '</div>';
        
        return $html;
    }
}

