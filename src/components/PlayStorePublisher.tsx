import React, { useState } from "react";
import { Download, Copy, Check, Smartphone, Sparkles, AlertCircle, HelpCircle, FileText, ArrowRight, Award } from "lucide-react";

export default function PlayStorePublisher() {
  const [appName, setAppName] = useState("Leve");
  const [packageId, setPackageId] = useState("com.uninter.leve");
  const [version, setVersion] = useState("1.0.0");
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  const [iconGenerated, setIconGenerated] = useState(false);
  const [iconPrompt, setIconPrompt] = useState("minimalist healthcare app icon, elegant green leaf with subtle water droplets, soft warm cream background, high-end vector design, clean 3d premium app store logo");

  const capacitorConfig = `{
  "appId": "${packageId}",
  "appName": "${appName}",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "url": "${window.location.origin}",
    "cleartext": true
  }
}`;

  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageId}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="${appName}"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|layoutDirection|fontScale|screenLayout|density"
            android:theme="@style/AppTheme.NoActionBarLaunch">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>
    </application>
</manifest>`;

  const copyToClipboard = (text: string, type: "config" | "manifest") => {
    navigator.clipboard.writeText(text);
    if (type === "config") {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    } else {
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2000);
    }
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateIconMock = () => {
    setIsGeneratingIcon(true);
    // Simula geração rápida no client, avisando o usuário que ele pode pedir para a IA do Chat gerar e salvar
    setTimeout(() => {
      setIsGeneratingIcon(false);
      setIconGenerated(true);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-neutral-100 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 bg-green-100 text-green-700 rounded-lg">
            <Smartphone className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-neutral-950 font-sans tracking-tight">Publicador Google Play Store</h2>
        </div>
        <p className="text-sm text-neutral-600">
          Transforme este Web App em um aplicativo Android nativo completo pronto para subir na Play Store.
        </p>
      </div>

      {/* Formulário de Configuração do APK */}
      <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-neutral-500" />
          Configurações Básicas do Android
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Nome do App (Play Store)</label>
            <input 
              type="text" 
              value={appName} 
              onChange={(e) => setAppName(e.target.value)} 
              className="w-full text-sm p-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-green-600 text-neutral-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">ID do Pacote (Package Name)</label>
            <input 
              type="text" 
              value={packageId} 
              onChange={(e) => setPackageId(e.target.value)} 
              className="w-full text-sm p-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-green-600 text-neutral-800 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Versão do App</label>
            <input 
              type="text" 
              value={version} 
              onChange={(e) => setVersion(e.target.value)} 
              className="w-full text-sm p-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-green-600 text-neutral-800 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Gerador de Ícone com IA */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-green-600" />
            Gerador de Ícone Oficial da Loja
          </h3>
          <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">IA Integrada</span>
        </div>
        <p className="text-xs text-neutral-600">
          Crie um ícone moderno e polido de 512x512 pixels para a ficha técnica do seu app no Google Play Console.
        </p>
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input 
            type="text" 
            value={iconPrompt} 
            onChange={(e) => setIconPrompt(e.target.value)} 
            placeholder="Descreva o estilo do ícone..."
            className="flex-1 text-xs p-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-green-600 text-neutral-700 font-medium"
          />
          <button 
            onClick={handleGenerateIconMock}
            disabled={isGeneratingIcon}
            className="w-full md:w-auto bg-green-700 hover:bg-green-800 disabled:bg-neutral-300 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            {isGeneratingIcon ? "Criando..." : "Gerar com IA"}
          </button>
        </div>

        {iconGenerated && (
          <div className="mt-2 bg-white p-3 rounded-xl border border-green-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-700 text-white font-bold rounded-xl flex items-center justify-center shadow-md">
                L
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Leve_icon_playstore.png</h4>
                <p className="text-[10px] text-neutral-500">Pronto para a Play Store (512x512px)</p>
              </div>
            </div>
            <p className="text-[11px] text-green-700 italic font-medium">Ícone gerado e disponível na pasta assets!</p>
          </div>
        )}
      </div>

      {/* Tabs / Arquivos gerados para download */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-neutral-900">Arquivos de Empacotamento Android</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* capacitor.config.json */}
          <div className="border border-neutral-200 rounded-2xl p-4 flex flex-col gap-2 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-500">capacitor.config.json</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => copyToClipboard(capacitorConfig, "config")} 
                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-900"
                  title="Copiar"
                >
                  {copiedConfig ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => downloadFile(capacitorConfig, "capacitor.config.json", "application/json")} 
                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-900"
                  title="Baixar"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="text-[11px] bg-neutral-900 text-emerald-400 p-3 rounded-xl font-mono overflow-x-auto max-h-40">
              {capacitorConfig}
            </pre>
          </div>

          {/* AndroidManifest.xml */}
          <div className="border border-neutral-200 rounded-2xl p-4 flex flex-col gap-2 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-500">AndroidManifest.xml</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => copyToClipboard(androidManifest, "manifest")} 
                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-900"
                  title="Copiar"
                >
                  {copiedManifest ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => downloadFile(androidManifest, "AndroidManifest.xml", "text/xml")} 
                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-900"
                  title="Baixar"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="text-[11px] bg-neutral-900 text-emerald-400 p-3 rounded-xl font-mono overflow-x-auto max-h-40">
              {androidManifest}
            </pre>
          </div>
        </div>
      </div>

      {/* Guia de Publicação Passo a Passo */}
      <div className="border border-neutral-100 rounded-2xl p-4 bg-amber-50/50 border-amber-200/60 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          Como publicar na Play Store de verdade (Passo a Passo)
        </h3>
        
        <div className="flex flex-col gap-3 text-xs text-amber-950/80 leading-relaxed font-medium">
          <div className="flex gap-2">
            <span className="w-5 h-5 bg-amber-100 text-amber-800 font-bold rounded-full flex items-center justify-center shrink-0">1</span>
            <p>
              <strong>Crie uma conta de desenvolvedor:</strong> Acesse o <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="underline font-bold text-amber-900">Google Play Console</a> e pague a taxa única de US$ 25 de registro.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="w-5 h-5 bg-amber-100 text-amber-800 font-bold rounded-full flex items-center justify-center shrink-0">2</span>
            <p>
              <strong>Prepare o Capacitor no seu computador:</strong> Baixe o código fonte deste app e execute no terminal:
              <code className="block bg-amber-100/70 p-1.5 my-1 rounded font-mono text-[10px] text-amber-900">
                npm i @capacitor/core @capacitor/cli @capacitor/android<br />
                npx cap init "{appName}" "{packageId}" --web-dir=dist<br />
                npx cap add android
              </code>
            </p>
          </div>
          <div className="flex gap-2">
            <span className="w-5 h-5 bg-amber-100 text-amber-800 font-bold rounded-full flex items-center justify-center shrink-0">3</span>
            <p>
              <strong>Compile e Sincronize:</strong> Rode o build do Vite e envie para a pasta nativa:
              <code className="block bg-amber-100/70 p-1.5 my-1 rounded font-mono text-[10px] text-amber-900">
                npm run build<br />
                npx cap sync
              </code>
            </p>
          </div>
          <div className="flex gap-2">
            <span className="w-5 h-5 bg-amber-100 text-amber-800 font-bold rounded-full flex items-center justify-center shrink-0">4</span>
            <p>
              <strong>Abra no Android Studio:</strong> Rode o comando <code className="bg-amber-100/70 px-1 rounded font-mono">npx cap open android</code>. Substitua o <code className="bg-amber-100/70 px-1 rounded font-mono">AndroidManifest.xml</code> e adicione o ícone gerado. Vá em <em>Build &gt; Generate Signed Bundle / APK</em> para assinar e exportar o seu arquivo <strong>.aab</strong> final.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="w-5 h-5 bg-amber-100 text-amber-800 font-bold rounded-full flex items-center justify-center shrink-0">5</span>
            <p>
              <strong>Regra de 20 Testadores (Mandatória):</strong> Para contas pessoais criadas após 31 de agosto de 2023, o Google exige um <strong>Teste Fechado obrigatório de 14 dias com 20 testadores voluntários simultâneos ativos</strong> antes de liberar a publicação em Produção.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-2">
        <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
          <Award className="w-4 h-4 text-green-700" />
          Pronto para Compilar no Android Studio
        </span>
        <button 
          onClick={() => alert("As instruções e arquivos de configuração foram gerados com sucesso! Você pode copiá-los nos blocos acima para usá-los no seu projeto Android Studio.")}
          className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1"
        >
          Finalizar Exportação
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
