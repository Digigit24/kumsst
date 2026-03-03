import { Check, Moon, Palette, Sun, Type } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { theme, font, colors, setTheme, setFont, setColors } = useTheme();

  const fonts = [
    { value: 'inter', label: 'Inter', className: 'font-inter' },
    { value: 'roboto', label: 'Roboto', className: 'font-roboto' },
    { value: 'system', label: 'System', className: 'font-system' }
  ];

  const colorPresets = [
    {
      name: 'Blue',
      primary: '221.2 83.2% 53.3%',
      secondary: '210 40% 96.1%'
    },
    {
      name: 'Purple',
      primary: '262.1 83.3% 57.8%',
      secondary: '270 40% 96.1%'
    },
    {
      name: 'Green',
      primary: '142.1 76.2% 36.3%',
      secondary: '138 40% 96.1%'
    },
    {
      name: 'Red',
      primary: '346.8 77.2% 49.8%',
      secondary: '0 40% 96.1%'
    },
    {
      name: 'Orange',
      primary: '24.6 95% 53.1%',
      secondary: '33 40% 96.1%'
    },
    {
      name: 'Pink',
      primary: '330.4 81.2% 60.4%',
      secondary: '330 40% 96.1%'
    },
    {
      name: 'Teal',
      primary: '173.4 80.4% 40%',
      secondary: '180 40% 96.1%'
    }
  ];

  const handleColorChange = (preset: { primary: string; secondary: string }) => {
    setColors(preset);
  };

  const isColorActive = (preset: { primary: string; secondary: string }) => {
    return colors.primary === preset.primary && colors.secondary === preset.secondary;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your application appearance and preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* Theme Mode Section */}
        <section className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            {theme === 'light' ? (
              <Sun className="w-5 h-5 text-primary" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
            <h2 className="text-xl font-semibold">Theme Mode</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Choose between light and dark mode
          </p>
          <div className="flex gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="w-4 h-4" />
              Light
              {theme === 'light' && <Check className="w-4 h-4 ml-1" />}
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="w-4 h-4" />
              Dark
              {theme === 'dark' && <Check className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </section>

        {/* Font Section */}
        <section className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Font Family</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Select your preferred font family
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {fonts.map((f) => (
              <Button
                key={f.value}
                variant={font === f.value ? 'default' : 'outline'}
                onClick={() => setFont(f.value as 'inter' | 'roboto' | 'system')}
                className={`flex items-center justify-between ${f.className}`}
              >
                <span>{f.label}</span>
                {font === f.value && <Check className="w-4 h-4 ml-2" />}
              </Button>
            ))}
          </div>
        </section>

        {/* Color Scheme Section */}
        <section className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Color Scheme</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Choose a color preset for your theme
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleColorChange(preset)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all
                  ${isColorActive(preset)
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-full shadow-md"
                    style={{
                      backgroundColor: `hsl(${preset.primary})`
                    }}
                  />
                  <span className="text-sm font-medium">{preset.name}</span>
                  {isColorActive(preset) && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Preview Section */}
        <section className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <p className="text-sm text-muted-foreground mb-4">
            See how your theme looks with different components
          </p>
          <div className="space-y-4 p-4 bg-background rounded-lg border">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm">
                This is a preview of muted background with text.
              </p>
            </div>
            <div className="p-4 bg-primary text-primary-foreground rounded-md">
              <p className="text-sm font-medium">
                Primary background with contrasting text
              </p>
            </div>
            <div className="p-4 bg-secondary text-secondary-foreground rounded-md">
              <p className="text-sm font-medium">
                Secondary background with contrasting text
              </p>
            </div>
          </div>
        </section>

        {/* Reset Section */}
        <section className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Reset Settings</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Reset all theme settings to default values
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setTheme('light');
              setFont('inter');
              setColors({ primary: '221.2 83.2% 53.3%', secondary: '210 40% 96.1%' });
            }}
          >
            Reset to Defaults
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Settings;
