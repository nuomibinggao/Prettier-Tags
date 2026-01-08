/*
Prettier Tags is an open-source script for the Overlayer and Overlayer.Scripting mod made for the game A Dance of Fire and Ice,
it is based on iTags, Better iTags Alpha, Not Enough Tags, and maimai.js (Original authors: SamXU1322, nuomibinggao, MLob_302).
This "Zero" version is a complete rewrite of the tags found from the original scripts for readability and maintainability,
it removes all the clutter and junk code from the original scripts, organizes the codebase, and simplifies/unifies the implementation. 

This script is tested on Overlayer 3.41.0 and Overlayer.Scripting 1.11.0, older versions' compatibility is not guaranteed.

ALPHA WARNING | This script is still in early development, features may be incomplete or broken, use at your own risk.
*/

import './Impl'
use(
    'Accuracy','XAccuracy',
    'CurMinute','CurSecond','TotalMinute','TotalSecond',
    'PHex','EPHex','VEHex','TEHex','FOHex','MPHex','CP','CEP','CLP','CTE','CTL','CVE','CVL','MissCount','Overloads','Multipress','CHitRaw',
    'CurTile','TotalTile',
    'Artist','Title','Author','EditorPitch','Pitch','ArtistRaw','TitleRaw','AuthorRaw',
    'Progress', 'ActualProgress',
    'TileBpm','CurBpm','RecKPS',
    'Fps', 'TargetFps',
    'MarginScale',
    'Year','Month','Day','Hour','Minute','Second','MilliSecond',
    'ColorRange','MovingMan','EasedValue',
    'CpuUsage','TotalCpuUsage','MemoryUsageGBytes','MemoryUsage','MemoryGBytes',
    'Timing', 'Difficulty', 'IsAutoEnabled', 'MarginScale'
);



// Utility class for common functions
class Lib {
  static Round(n, Decimals = 2) {
    const f = 10 ** Decimals
    return Math.round((n + Number.EPSILON) * f) / f
  }
  static Pad(Num, Len) {
    return Num.toString().padStart(Len, '0');
  }

  static CurJudgeColor() {
    const Index = [TEHex(), VEHex(), EPHex(), PHex(), EPHex(), VEHex(), TEHex(), FOHex(), FOHex(), MPHex()]
    const Hex = Index[CHitRaw()]
    return `<color=#${Hex}>`
  }

  static GradientText(Tag, Min, Max, Hex1, Hex2, Text) {
    return `<color=#${ColorRange(Tag, Min, Max, Hex1, Hex2)}>${Text}</color>`
  }
  static ValueBasedColorRange(Value, MinRange, MaxRange, Hex1 = 'ffffff', Hex2 = 'ffffff', Text) {
    const h1 = (Hex1 || 'ffffff').replace(/^#/, '').toLowerCase().replace(/^([0-9a-f])([0-9a-f])([0-9a-f])$/i, '$1$1$2$2$3$3');
    const h2 = (Hex2 || 'ffffff').replace(/^#/, '').toLowerCase().replace(/^([0-9a-f])([0-9a-f])([0-9a-f])$/i, '$1$1$2$2$3$3');
    if (h1.length !== 6 || h2.length !== 6) return `<color=#ffffff>${Text}</color>`;
    if (MinRange === MaxRange) return `<color=#${h1}>${Text}</color>`;

    const t = Math.max(0, Math.min(1, (Value - MinRange) / (MaxRange - MinRange)));
    const a = parseInt(h1, 16), b = parseInt(h2, 16);
    const r = Math.round((a >> 16) + (((b >> 16) - (a >> 16)) * t));
    const g = Math.round(((a >> 8) & 255) + ((((b >> 8) & 255) - ((a >> 8) & 255)) * t));
    const bl = Math.round((a & 255) + (((b & 255) - (a & 255)) * t));
    const hex = ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1).toLowerCase();

    return `<color=#${hex}>${Text}</color>`;
  } // This function is used when Tags are not avaliable for ColorRange, only use when neccessary.

  static RGB(OpacityPercentage = 100) {
    const ClampedPercentage = Math.max(0, Math.min(100, OpacityPercentage));
    const AlphaValue = Math.round((ClampedPercentage / 100) * 255);
    const AlphaString = AlphaValue.toString(16).padStart(2, '0');

    const Ms = MilliSecond();
    const Ranges = [
      { Start: 0, End: 166, From: `ff0000${AlphaString}`, To: `ffff00${AlphaString}` },
      { Start: 166, End: 333, From: `ffff00${AlphaString}`, To: `00ff00${AlphaString}` },
      { Start: 333, End: 500, From: `00ff00${AlphaString}`, To: `00ffff${AlphaString}` },
      { Start: 500, End: 666, From: `00ffff${AlphaString}`, To: `0000ff${AlphaString}` },
      { Start: 666, End: 833, From: `0000ff${AlphaString}`, To: `ff00ff${AlphaString}` },
      { Start: 833, End: 1000, From: `ff00ff${AlphaString}`, To: `ff0000${AlphaString}` }
    ];

    for (const Range of Ranges) {
      if (Ms < Range.End) {
          return ColorRange('MilliSecond', Range.Start, Range.End, Range.From, Range.To);
      }
    }
  }

  static ParseTitleTags(Tag) {
    return Tag ? Tag
      .replace(/color\s*=\s*(['\"])(.*?)\1/gi, 'color=$2') // normalize quoted color attributes: color="ff00ff" or color='ff00ff' -> color=ff00ff
      .replace(/<\/?size=[^>]*>/g, '') // strip <size=...> tags (prevent leftover sizing from source tags)
      .replace(/<color=#([A-Fa-f0-9]{6})([A-Fa-f0-9]{2})?>/g, (match, hex6, alpha) => alpha === '00' ? match : `<color=#${hex6}>`) // if alpha === '00' (fully transparent) keep original tag so later cleanup can remove empty transparent lines; otherwise normalize to 6-digit hex
      : '';
  }
}



// Tag definition classes
class Percentages {
  static TilePercentage(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 2) {
    return `${Lib.GradientText('Progress', 0, 100, Hex1, Hex2, Progress(Decimals))}%`;
  }
  static SongPercentage(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 2) {
    return `${Lib.GradientText('ActualProgress', 0, 100, Hex1, Hex2, ActualProgress(Decimals))}%`;
  }
  static StartPercentage(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 2) {
    return (StartTile() === 1) ?  `<color=#${Hex1}>0</color>%` : `${Lib.GradientText('StartProgress', 0, 100, Hex1, Hex2, StartProgress(Decimals))}%`;
  }
  static BestTilePercentage(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 2) {
    const FixedBestProgress = parseFloat(BestProgress().toFixed(Decimals));
    return `${Lib.GradientText('BestProgress', 0, 100, Hex1, Hex2, FixedBestProgress)}%`;
  }

  static Display(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 2) {
    return `${this.TilePercentage(Hex1, Hex2, Decimals)} ~ ${this.SongPercentage(Hex1, Hex2, Decimals)} (Best ${this.BestTilePercentage(Hex1, Hex2, Decimals)})`;
  }
}

class Accuracies {
  static Acc(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 2) {
    const Acc = (Number.isFinite(Accuracy(Decimals))) ? Accuracy(Decimals) : 100
    return (XAccuracy() === 100 || !Number.isFinite(XAccuracy())) ? `<color=#ffda00>${Acc}</color>%` : `${Lib.GradientText('XAccuracy', 0, 100, Hex2, Hex1, Acc)}%`;
  }
  static XAcc(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 2) {
    const XAcc = (Number.isFinite(XAccuracy(Decimals))) ? XAccuracy(Decimals) : 100
    return (XAcc === 100) ? `<color=#ffda00>100</color>%` : `${Lib.GradientText('XAccuracy', 0, 100, Hex2, Hex1, XAcc)}%`;
  }

  static MaxPossibleAcc(Hex1 = "ffffff", Hex2 = "ffffff", Decimals = 2) {
      const AllJudges = CP() + CEP() + CLP() + CVE() + CVL() + CTE() + MissCount() + Overloads()
      let MaxAcc = (((CP() + LeftTile() + CEP() + CLP()) / (AllJudges + LeftTile() + MissCount() + Overloads())) + (CP() + LeftTile()) * 0.0001) * 100;
      const MaxXAcc = (((CP() + LeftTile()) + (CEP() + CLP()) * 0.75 + (CVE() + CVL()) * 0.4 + CTE() * 0.2) / (AllJudges + LeftTile()) * (0.9875 ** CheckPointUsed())) * 100

      MaxAcc = Number.isFinite(MaxAcc) ? Lib.Round(MaxAcc, Decimals) : 0

        if (!Number.isFinite(MaxXAcc)) return `<color=#ffda00>100</color>%`

        if (MaxXAcc === 100) return `<color=#ffda00>${Lib.Round(100 + (TotalTile() - StartTile()) * 0.01, Decimals)}</color>%`

        return `${Lib.ValueBasedColorRange(MaxAcc, 0, 100, Hex2, Hex1, MaxAcc)}</color>%`
  }
  static MaxPossibleXAcc(Hex1 = "ffffff", Hex2 = "ffffff", Decimals = 2) {
    const AllJudges = CP() + CEP() + CLP() + CVE() + CVL() + CTE() + MissCount() + Overloads()
    const MaxXAcc = (((CP() + LeftTile()) + (CEP() + CLP()) * 0.75 + (CVE() + CVL()) * 0.4 + CTE() * 0.2) / (AllJudges + LeftTile()) * (0.9875 ** CheckPointUsed())) * 100

    return !Number.isFinite(MaxXAcc) || MaxXAcc === 100 ? `<color=#ffda00>100</color>%` : `${Lib.ValueBasedColorRange(MaxXAcc, 0, 100, Hex2, Hex1, parseFloat(MaxXAcc.toFixed(Decimals)))}</color>%`;
  }

  static AccDisplay(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 2) {
    return `X-${this.XAcc(Hex1, Hex2, Decimals)} (${this.Acc(Hex1, Hex2, Decimals)})`;
  }
  static MaxPossibleAccDisplay(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 2) {
    return `X-${this.MaxPossibleXAcc(Hex1, Hex2, Decimals)} (${this.MaxPossibleAcc(Hex1, Hex2, Decimals)})`;
  }
}

class TileDatas {
  static TBPM(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 3, Max = 8000) {
    return `${Lib.GradientText('TileBpm', 0, Max, Hex1, Hex2, TileBpm(Decimals))}`;
  }
  static CBPM(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 3, Max = 16000) {
    const ActualCBPM = !isFinite(CurBpm()) ? TileBpm(Decimals) : CurBpm(Decimals);
    return `${Lib.ValueBasedColorRange(ActualCBPM, 0, Max, Hex1, Hex2, ActualCBPM)}`;
  }

  static KPS(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 2, Max = 160) {
    const ActualKPS = !isFinite(RecKPS()) ? (TileBpm(Decimals) / 60) : RecKPS(Decimals);
    return `${Lib.ValueBasedColorRange(ActualKPS, 0, Max, Hex1, Hex2, ActualKPS)}`;
  }
}

class SystemDatas {
  static DateDisplay(DateHex = 'ffffff', TimeHex = 'ffffff', DateSeperatorChar = '.', SpacingsNumber = 2) {
    return `<color=#${DateHex}>${Year()}${DateSeperatorChar}${Lib.Pad(Month(),2)}${DateSeperatorChar}${Lib.Pad(Day(),2)}</color>${' '.repeat(SpacingsNumber)}<color=#${TimeHex}>${Lib.Pad(Hour(),2)}:${Lib.Pad(Minute(),2)}:${Lib.Pad(Second(),2)}</color>`;
  }

  static CPUDisplay(Hex1 = 'ffffff', Hex2 = 'ffffff', WarningHex = 'ff0000', WarningThresholdPercentage = 80, Decimals = 2) {
    return (CpuUsage() >= WarningThresholdPercentage) ? `<color=#${WarningHex}>${CpuUsage(Decimals)}</color>%`
    : Lib.GradientText('CpuUsage', 0, WarningThresholdPercentage, Hex1, Hex2, `${CpuUsage(Decimals)}</color>%`);
  }
  static MemoryDisplay(Hex1 = 'ffffff', Hex2 = 'ffffff', WarningHex = 'ff0000', WarningThresholdPercentage = 75, GBDecimals = 2, PercentageDecimals = 1) {
    return (MemoryUsage() >= WarningThresholdPercentage) ? `<color=#${WarningHex}>${MemoryUsageGBytes(GBDecimals)}</color>GB / <color=#${Hex2}>${MemoryGBytes(GBDecimals)}GB (<color=#${WarningHex}>${MemoryUsage(PercentageDecimals)}</color>%)`
    : `${Lib.GradientText('MemoryUsage', 0, WarningThresholdPercentage, Hex1, Hex2, MemoryUsageGBytes(GBDecimals))}</color>GB / <color=#${Hex2}>${MemoryGBytes(GBDecimals)}GB (${Lib.GradientText('MemoryUsage', 0, WarningThresholdPercentage, Hex1, Hex2, MemoryUsage(PercentageDecimals))}</color>%)`;
  }

  static FPSDisplay(Hex1 = 'ffffff', Hex2 = 'ffffff', WarningHex = 'ff0000', WarningThreshold = 60, Decimals = 1) {
    const TargetFPS = (TargetFps() === 10000) ? `<size=125%>\u221e</size>` : TargetFps();
    return (Fps() <= WarningThreshold) ? `<color=#${WarningHex}>${Fps(Decimals)}</color> / <color=#${Hex2}>${TargetFPS}</color>`
    : `${Lib.GradientText('Fps', 0, WarningThreshold, Hex1, Hex2, Fps(Decimals))} / <color=#${Hex2}>${TargetFPS}</color>`;
  }
  static FrameTimeDisplay(Hex1 = 'ffffff', Hex2 = 'ffffff', WarningHex = 'ff0000', WarningThresholdMs = 16.67, Decimals = 2) {
    return (FrameTime() >= WarningThresholdMs) ? `<color=#${WarningHex}>${FrameTime(Decimals)}</color>ms`
    : `${Lib.GradientText('FrameTime', 0, WarningThresholdMs, Hex1, Hex2, FrameTime(Decimals))}ms`;
  }
}

class LevelInfoDisplays {
  static Duration(Hex1 = 'ffffff', Hex2 = 'ffffff') {
    return (ActualProgress() === 100) ? `<color=#${Hex1}>${TotalMinute()}:${Lib.Pad(TotalSecond(), 2)}</color> / <color=#${Hex2}>${TotalMinute()}:${Lib.Pad(TotalSecond(), 2)}</color>` : `<color=#${Hex1}>${CurMinute()}:${Lib.Pad(CurSecond(), 2)}</color> / <color=#${Hex2}>${TotalMinute()}:${Lib.Pad(TotalSecond(), 2)}</color>`;
  }
  static Tile(Hex1 = 'ffffff', Hex2 = 'ffffff', Hex3 = 'ffffff') {
    return `<color=#${Hex1}>${CurTile() - 1}</color> / <color=#${Hex2}>${TotalTile() - 1}</color> (-<color=#${Hex3}>${LeftTile()}</color>)`;
  }

  static TileProgressBar(HexPlayed = '999999', HexUnplayed = 'ffffff', Length = 3, Char = '|') {
    if (Progress(0) === 100 && CurMinute()=== 0 && CurSecond() === 0) {
      const BarPlayed = Char.repeat(100 * Length)
      const BarUnplayed = ''
      const Bar = `<color=#${HexPlayed}>${BarPlayed}<color=#${HexUnplayed}>${BarUnplayed}</color>`
      return Bar;
    } else {
      const BarPlayed = Char.repeat(Progress(0) * Length)
      const BarUnplayed = Char.repeat(Length * 100 - Progress(0) * Length)
      const Bar = `<color=#${HexPlayed}>${BarPlayed}<color=#${HexUnplayed}>${BarUnplayed}</color>`
      return Bar;
    }
  }
  static SongProgressBar(HexPlayed = '999999', HexUnplayed = 'ffffff', Length = 3, Char = '|') {
    if (ActualProgress() === 100 && CurMinute()=== 0 && CurSecond() === 0) {
      const BarPlayed = Char.repeat(100 * Length)
      const BarUnplayed = ''
      const Bar = `<color=#${HexPlayed}>${BarPlayed}<color=#${HexUnplayed}>${BarUnplayed}</color>`
      return Bar;
    } else {
      const BarPlayed = Char.repeat(ActualProgress() * Length)
      const BarUnplayed = Char.repeat(Length * 100 - ActualProgress() * Length)
      const Bar = `<color=#${HexPlayed}>${BarPlayed}<color=#${HexUnplayed}>${BarUnplayed}</color>`
      return Bar;
    }
  }

  static TitleDisplay(Hex = 'ffffff', LineSpacingPercentage = 65, SpeedSizePercentage = 70, SecondLineSizePercentage = 80, AuthorSizePercentage = 65) {
    const ArtistProcessed = Lib.ParseTitleTags(ArtistRaw());
    const TitleUnprocessed = Lib.ParseTitleTags(TitleRaw());
    const AuthorUnprocessed = Lib.ParseTitleTags(AuthorRaw());

    const AuthorProcessed = AuthorUnprocessed ? `<color=#${Hex}><size=${AuthorSizePercentage}%>Map By ${AuthorUnprocessed}</size></color>\n` : '';

    const ActualSpeed = Pitch() * EditorPitch();
    const SpeedDisplay = ActualSpeed !== 1 ? ` <color=#${Hex}><size=${SpeedSizePercentage}%>(${ActualSpeed}\u00d7)</size></color>` : '';
    
    const TitleProcessed = TitleUnprocessed
      .replace(/\n(?:\s*<color=#(?:[A-Fa-f0-9]{6})?00>)*\s*$/gmi, '') // remove trailing newlines and any trailing transparent color tags (cleanup empty lines at end)
      .replace(/ {10,}/, '\n') // convert the first long-space separator into a newline
      .replace(/\n([\s\S]*?)(?=\n|$)/, `\n<size=${SecondLineSizePercentage}%>$1${SpeedDisplay}`) // add size to the first second-line and append speed on the same line
      .replace(/^[^\n]*$/, `$&${SpeedDisplay}`); // if no second line exists, append speed after the single-line title

    return `<line-height=${LineSpacingPercentage}%>${ArtistProcessed}${ArtistProcessed ? ' - ' : ''}${TitleProcessed}\n${AuthorProcessed}</line-height>`;
  }
}

class PlayerPerformanceDisplays {
  static AverageInputOffset(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 2, ThresholdMS = 20) {
    const Display = TimingAvg(Decimals);
    const Value = Math.abs(Display);
    const base = Math.abs(ThresholdMS);
    const Threshold = CurTile() <= 4 ? base * 4 : (Progress() > 75 ? base * 0.5 : base);
    return `${Lib.ValueBasedColorRange(Value, 0, Threshold, Hex1, Hex2, Display)}</color>ms`;
  }
  static CurInputOffset(Decimals = 2) {
    return `${Lib.CurJudgeColor()}${Timing(Decimals)}</color>ms`;
  }

  static PureComboDisplay(Hex1 = 'ffffff', Hex2 = 'ffffff', MaxTrackedCombos = 3000, LabelSizePercentage = 35, LabelHex = 'ffffff', Label = 'Perfect Combo', ShowThreshold = 3) {
    const ActualMaxTrackedCombos = (MaxTrackedCombos > (TotalTile() - 1)) ? (TotalTile() - 1) : MaxTrackedCombos;
    return (Combo() >= ShowThreshold) ? `${Lib.GradientText('Combo', ShowThreshold, ActualMaxTrackedCombos, Hex1, Hex2, `<size=${MovingMan('Combo', 100, 150, 100, 800, 'true')}%>${Combo()}`)}
<size=${LabelSizePercentage}%><color=#${LabelHex}>${Label}</color></size>` : ``
  }
  static PerfectsComboDisplay(Hex1 = 'ffffff', Hex2 = 'ffffff', MaxTrackedCombos = 5000, LabelSizePercentage = 35, LabelHex = 'ffffff', Label = 'Perfects Combo', ShowThreshold = 5) {
    const ActualMaxTrackedCombos = (MaxTrackedCombos > (TotalTile() - 1)) ? (TotalTile() - 1) : MaxTrackedCombos;

    const PerfectsCombo = MarginCombos('Perfect|EarlyPerfect|LatePerfect|VeryEarly|VeryLate');
    const MinRange = CurTile() - PerfectsCombo + ShowThreshold;
    const MaxRange = MinRange + ActualMaxTrackedCombos;

    return (PerfectsCombo >= ShowThreshold)
      ? `<size=${(CHitRaw() >= 1 && CHitRaw() <= 3) ? MovingMan('CurTile', 100, 150, 100, 800, 'true') : 100}%>${Lib.GradientText('CurTile', MinRange, MaxRange, Hex1, Hex2, PerfectsCombo)}</size>
<size=${LabelSizePercentage}%><color=#${LabelHex}>${Label}</color></size>` : '';
  }
  static ActualComboDisplay(Hex1 = 'ffffff', Hex2 = 'ffffff', MaxTrackedCombos = 10000, LabelSizePercentage = 35, LabelHex = 'ffffff', Label = 'Combo', ShowThreshold = 10) {
    const ActualMaxTrackedCombos = (MaxTrackedCombos > (TotalTile() - 1)) ? (TotalTile() - 1) : MaxTrackedCombos;
    
    const ActualCombo = MarginCombos('Perfect|EarlyPerfect|LatePerfect|VeryEarly|VeryLate');
    const MinRange = CurTile() - ActualCombo + ShowThreshold;
    const MaxRange = MinRange + ActualMaxTrackedCombos;
    return (ActualCombo >= ShowThreshold)
      ? `<size=${(CHitRaw() >= 1 && CHitRaw() <= 5) ? MovingMan('CurTile', 100, 150, 100, 800, 'true') : 100}%>${Lib.GradientText('CurTile', MinRange, MaxRange, Hex1, Hex2, ActualCombo)}</size>
<size=${LabelSizePercentage}%><color=#${LabelHex}>${Label}</color></size>` : '';
  }
  static AdaptiveComboDisplay(Hex1 = 'ffffff', Hex2 = 'ffffff') {
    const IsAutoOn = (IsAutoEnabled() === true);
    if (IsAutoOn) return `<size=${MovingMan('Combo', 100, 150, 100, 800, 'true')}%><color=#${Lib.RGB(100)}>${Combo()}</color>\n<size=35%>Autoplay</size>`;
    if (Difficulty() === 'Strict' && !IsAutoOn) return this.PureComboDisplay(Hex1, Hex2, 3000, 35, 'ffffff', 'Perfect Combo', 3);
    if (Difficulty() === 'Lenient' && !IsAutoOn) return this.ActualComboDisplay(Hex1, Hex2, 10000, 35, 'ffffff', 'Combo', 10);
    if (Difficulty() === 'Normal' && !IsAutoOn) return this.PerfectsComboDisplay(Hex1, Hex2, 5000, 35, 'ffffff', 'Perfects Combo', 5);
  }

  static AdaptiveStatusLabel(Hex1, Hex2, ProgressDecimals = 2, MarginDecimals = 2) {
    const Difficulties = { 'Strict': '#b11a1a', 'Lenient': '#3acf4e', 'Normal': '#ffffff' };
    const ColoredDifficulty = `<color=${Difficulties[DifficultyRaw()] || Difficulties['Normal']}>${DifficultyRaw()}</color>`;

    if (CurTile() !== TotalTile()) {
      return `Hit Margin Scale | <size=${MovingMan('MarginScale', 100, 110, 100, 800, 'true')}%>${Lib.GradientText('MarginScale', 25, 100, Hex1, Hex2, MarginScale(MarginDecimals) * 100)}</color>%</size>`;
    }

    if (StartProgress() === 100 && CurTile === -1) return '';

    if (TotalTile() === 0 && StartTile() >= 1) return '';

    if (StartTile() === 1 && Progress(0) === 100) {
      if (XAccuracy() === 100) return `${ColoredDifficulty} Difficulty <color=#ffda00>Pure Perfect!</color>`;
      if (MissCount() > 0 || Overloads() > 0) return `${ColoredDifficulty} Difficulty <color=#${FOHex()}>${MissCount() + Overloads()} Death <color=#ffffff>(Max Combo <color=#87cefa>${MaxCombo()}<color=#ffffff>)</color>`;
      if (CTE() === 0 && CVE() === 0 && CVL() === 0 && CTL() === 0) return `${ColoredDifficulty} Difficulty <color=#a0ff4e>All Perfect! <color=#ffffff>(Max Combo <color=#87cefa>${MaxCombo()}<color=#ffffff>)</color>`;
      if (CTE() === 0) return `${ColoredDifficulty} Difficulty <color=#87cefa>Full Combo! <color=#ffffff>(Max Combo <color=#87cefa>${MaxCombo()}<color=#ffffff>)</color>`;
      return `${ColoredDifficulty} Difficulty <color=#ffffff>Cleared! <color=#ffffff>(Max Combo <color=#87cefa>${MaxCombo()}<color=#ffffff>)</color>`;
    }

    const ProgressDisplay = `${Lib.GradientText('StartProgress', 0, 100, Hex1, Hex2, StartProgress(ProgressDecimals))}<color=#ffffff>% ~ ${Lib.GradientText('Progress', 0, 100, Hex1, Hex2, Progress(ProgressDecimals))}<color=#ffffff>% `;

    if (XAccuracy() === 100) return ProgressDisplay + `${ColoredDifficulty} Difficulty <color=#ffda00>Pure Perfect!</color>`;

    if (Progress(0) === 100) {
      if (MissCount() === 0 && Overloads() === 0) {
        if (CTE() === 0 && CVE() === 0 && CVL() === 0 && CTL() === 0) return ProgressDisplay + `${ColoredDifficulty} Difficulty <color=#a0ff4e>All Perfect! <color=#ffffff>(Max Combo <color=#87cefa>${MaxCombo()}<color=#ffffff>)</color>`;
        if (CTE() === 0) return ProgressDisplay + `${ColoredDifficulty} Difficulty <color=#87cefa>Full Combo! <color=#ffffff>(Max Combo <color=#87cefa>${MaxCombo()}<color=#ffffff>)</color>`;
        return ProgressDisplay + `${ColoredDifficulty} Difficulty <color=#ffffff>Cleared! <color=#ffffff>(Max Combo <color=#87cefa>${MaxCombo()}<color=#ffffff>)</color>`;
      }
      return ProgressDisplay + `${ColoredDifficulty} Difficulty <color=#${FOHex()}>${MissCount() + Overloads()} Death <color=#ffffff>(Max Combo <color=#87cefa>${MaxCombo()}<color=#ffffff>)</color>`;
    }

    return 'Get Ready...';
  }
}

class Extras {
  static RGB(OpacityPercentage = 100) {
    return Lib.RGB(OpacityPercentage);
  }
}



// Tag registrations in Overlayer.Scripting mod
registerTag('TileProgressPercentage', function (Hex1, Hex2, Decimals) {
  return Percentages.TilePercentage(Hex1, Hex2, Decimals);
}, true, '')
registerTag('SongProgressPercentage', function (Hex1, Hex2, Decimals) {
  return Percentages.SongPercentage(Hex1, Hex2, Decimals);
}, true, '')
registerTag('StartProgressPercentage', function (Hex1, Hex2, Decimals) {
  return Percentages.StartPercentage(Hex1, Hex2, Decimals);
}, true, '')
registerTag('BestTileProgressPercentage', function (Hex1, Hex2, Decimals) {
  return Percentages.BestTilePercentage(Hex1, Hex2, Decimals);
}, true, '')

registerTag('MultiProgressPercentageDisplay', function (Hex1, Hex2, Decimals) {
  return Percentages.Display(Hex1, Hex2, Decimals);
}, true, '')


registerTag('Acc', function (Hex1, Hex2, Decimals) {
  return Accuracies.Acc(Hex1, Hex2, Decimals);
}, true, '')
registerTag('XAcc', function (Hex1, Hex2, Decimals) {
  return Accuracies.XAcc(Hex1, Hex2, Decimals);
}, true, '')

registerTag('MaxPossibleAcc', function (Hex1, Hex2, Decimals) {
  return Accuracies.MaxPossibleAcc(Hex1, Hex2, Decimals);
}, true, '')
registerTag('MaxPossibleXAcc', function (Hex1, Hex2, Decimals) {
  return Accuracies.MaxPossibleXAcc(Hex1, Hex2, Decimals);
}, true, '')

registerTag('MultiAccDisplay', function (Hex1, Hex2, Decimals) {
  return Accuracies.AccDisplay(Hex1, Hex2, Decimals);
}, true, '')
registerTag('MultiMaxAccDisplay', function (Hex1, Hex2, Decimals) {
  return Accuracies.MaxPossibleAccDisplay(Hex1, Hex2, Decimals);
}, true, '')


registerTag('TileBPM', function (Hex1, Hex2, Decimals, Max) {
  return TileDatas.TBPM(Hex1, Hex2, Decimals, Max);
}, true, '')
registerTag('ActualBPM', function (Hex1, Hex2, Decimals, Max) {
  return TileDatas.CBPM(Hex1, Hex2, Decimals, Max);
}, true, '')

registerTag('KPS', function (Hex1, Hex2, Decimals, Max) {
  return TileDatas.KPS(Hex1, Hex2, Decimals, Max);
}, true, '')


registerTag('DateDisplay', function (DateHex, TimeHex, ConnectorChar, SpacingsNumber) {
  return SystemDatas.DateDisplay(DateHex, TimeHex, ConnectorChar, SpacingsNumber);
}, true, '')

registerTag('CPUDisplay', function (Hex1, Hex2, WarningHex, WarningThresholdPercentage, Decimals) {
  return SystemDatas.CPUDisplay(Hex1, Hex2, WarningHex, WarningThresholdPercentage, Decimals);
}, true, '')
registerTag('MemoryDisplay', function (Hex1, Hex2, WarningHex, WarningThresholdPercentage, GBDecimals, PercentageDecimals) {
  return SystemDatas.MemoryDisplay(Hex1, Hex2, WarningHex, WarningThresholdPercentage, GBDecimals, PercentageDecimals);
}, true, '')

registerTag('FPSDisplay', function (Hex1, Hex2, WarningHex, WarningThreshold, Decimals) {
  return SystemDatas.FPSDisplay(Hex1, Hex2, WarningHex, WarningThreshold, Decimals);
}, true, '')
registerTag('FrameTimeDisplay', function (Hex1, Hex2, WarningHex, WarningThresholdMs, Decimals) {
  return SystemDatas.FrameTimeDisplay(Hex1, Hex2, WarningHex, WarningThresholdMs, Decimals);
}, true, '')


registerTag('DurationDisplay', function (Hex1, Hex2) {
  return LevelInfoDisplays.Duration(Hex1, Hex2);
}, true, '')
registerTag('TileProgressDisplay', function (Hex1, Hex2, Hex3) {
  return LevelInfoDisplays.Tile(Hex1, Hex2, Hex3);
}, true, '')

registerTag('TileProgressBar', function (HexPlayed, HexUnplayed, Length, Char) {
  return LevelInfoDisplays.TileProgressBar(HexPlayed, HexUnplayed, Length, Char);
}, true, '')
registerTag('SongProgressBar', function (HexPlayed, HexUnplayed, Length, Char) {
  return LevelInfoDisplays.SongProgressBar(HexPlayed, HexUnplayed, Length, Char);
}, true, '')

registerTag('TitleDisplay', function (Hex, LineSpacing, SpeedSizePercentage, SecondLineSizePercentage, AuthorSizePercentage) {
  return LevelInfoDisplays.TitleDisplay(Hex, LineSpacing, SpeedSizePercentage, SecondLineSizePercentage, AuthorSizePercentage);
}, true, '')


registerTag('AvgInputOffset', function (Hex1, Hex2, Decimals, ThresholdMS) {
  return PlayerPerformanceDisplays.AverageInputOffset(Hex1, Hex2, Decimals, ThresholdMS);
}, true, '')
registerTag('CurInputOffset', function (Decimals) {
  return PlayerPerformanceDisplays.CurInputOffset(Decimals);
}, true, '')

registerTag('PureComboDisplay', function (Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold) {
  return PlayerPerformanceDisplays.PureComboDisplay(Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold);
}, true, '')
registerTag('PerfectsComboDisplay', function (Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold) {
  return PlayerPerformanceDisplays.PerfectsComboDisplay(Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold);
}, true, '')
registerTag('ActualComboDisplay', function (Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold) {
  return PlayerPerformanceDisplays.ActualComboDisplay(Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold);
}, true, '')

registerTag('AdaptiveComboDisplay', function (Hex1, Hex2) {
  return PlayerPerformanceDisplays.AdaptiveComboDisplay(Hex1, Hex2);
}, true, '')

registerTag('AdaptiveStatusLabel', function (Hex1, Hex2, ProgressDecimals) {
  return PlayerPerformanceDisplays.AdaptiveStatusLabel(Hex1, Hex2, ProgressDecimals);
}, true, '')


registerTag('RGB', function (OpacityPercentage) {
  return Extras.RGB(OpacityPercentage);
}, true, '')