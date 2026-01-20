export default function RegistryHomePage() {
  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>TurboKit Global Registry</h1>
      <p>
        This is the global preset registry for TurboKit. It's NOT included in the
        template scaffold - it stays in the turbokit repo only.
      </p>

      <h2>API Endpoints</h2>
      <ul>
        <li>
          <code>GET /api/presets</code> - List all public presets
          <ul>
            <li><code>?filter=all</code> - All presets (default)</li>
            <li><code>?filter=builtin</code> - Only TurboKit official presets</li>
            <li><code>?filter=verified</code> - Official + verified community presets</li>
          </ul>
        </li>
        <li>
          <code>GET /api/presets/:id</code> - Get a single preset by ID
        </li>
        <li>
          <code>GET /api/stats</code> - Registry statistics
        </li>
      </ul>

      <h2>Built-in Presets</h2>
      <ul>
        <li><strong>koto</strong> - Default TurboKit preset (iOS-inspired, warm, minimal)</li>
        <li><strong>sacred</strong> - Terminal aesthetic (17 monospace fonts, OKLCH tinting)</li>
        <li><strong>kumori</strong> - iOS parity (exact colors, glassmorphism)</li>
      </ul>

      <h2>For TurboKit Maintainers</h2>
      <p>To seed the registry with built-in presets:</p>
      <pre style={{
        background: '#f5f5f5',
        padding: '1rem',
        borderRadius: '4px',
        overflow: 'auto'
      }}>
        cd apps/registry{'\n'}
        npx convex dev{'\n'}
        # In Convex dashboard, run internal.registry.seedBuiltinPresets()
      </pre>
    </div>
  );
}
