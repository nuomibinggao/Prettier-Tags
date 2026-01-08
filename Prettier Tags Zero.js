/* 
https://github.com/nuomibinggao/Prettier-Tags
Version Zero Release 1
*/

import './Impl'
use(
    'Accuracy','XAccuracy',
    'CurMinute','CurSecond','TotalMinute','TotalSecond',
    'PHex','EPHex','VEHex','TEHex','FOHex','MPHex','CP','CEP','CLP','CTE','CTL','CVE','CVL','CELP','CV','CT','MissCount','Overloads','Multipress','CHitRaw',
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

  static GradientText(Tag, MinRange, MaxRange, Hex1, Hex2, Text) {
    return `<color=#${ColorRange(Tag, MinRange, MaxRange, Hex1, Hex2)}>${Text}</color>`
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
  static DateDisplay(DateHex = 'ffffff', TimeHex = 'ffffff', DateSeperatorChar = '.', SpacingsNumber = 2, System = 12, MinorElementsSizePercentage = 75) {
    const AmPmIndicator = Hour() >= 12 ? 'P.M.' : 'A.M.';
    const TwelveHourClockSystemHour = Hour() % 12 === 0 ? 12 : Hour() % 12;
    return Number(System) === 12 ? `<color=#${DateHex}>${Year()}${DateSeperatorChar}${Lib.Pad(Month(), 2)}${DateSeperatorChar}${Lib.Pad(Day(), 2)}</color>${' '.repeat(SpacingsNumber)}<color=#${TimeHex}>${TwelveHourClockSystemHour}:${Lib.Pad(Minute(),2)}<size=${MinorElementsSizePercentage}%>:${Lib.Pad(Second(), 2)} ${AmPmIndicator}</size></color>`
    : Number(System) === 24 ? `<color=#${DateHex}>${Year()}${DateSeperatorChar}${Lib.Pad(Month(), 2)}${DateSeperatorChar}${Lib.Pad(Day(), 2)}</color>${' '.repeat(SpacingsNumber)}<color=#${TimeHex}>${Lib.Pad(Hour(), 2)}:${Lib.Pad(Minute(), 2)}:${Lib.Pad(Second(),2)}</color>`
    : `Error: Parameter "System" can only be values 12 or 24.`;
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
  static AverageInputOffset(Hex1 = 'ffffff', Hex2 = 'ffffff', Decimals = 2, ThresholdMs = 20) {
    const Display = TimingAvg(Decimals);
    const Value = Math.abs(Display);
    const base = Math.abs(ThresholdMs);
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
    if (IsAutoOn) return `<size=${MovingMan('Combo', 100, 150, 100, 800, 'true')}%><color=#${Extras.RGB(100)}>${Combo()}</color>\n<size=35%>Autoplay</size>`;
    if (Difficulty() === 'Strict' && !IsAutoOn) return this.PureComboDisplay(Hex1, Hex2, 3000, 35, 'ffffff', 'Perfect Combo', 3);
    if (Difficulty() === 'Lenient' && !IsAutoOn) return this.ActualComboDisplay(Hex1, Hex2, 10000, 35, 'ffffff', 'Combo', 10);
    if (Difficulty() === 'Normal' && !IsAutoOn) return this.PerfectsComboDisplay(Hex1, Hex2, 5000, 35, 'ffffff', 'Perfects Combo', 5);
  }

  static AdaptiveStatusLabel(Hex1, Hex2, ProgressDecimals = 2, MarginDecimals = 2) {
    const Difficulties = { 'Strict': '#b11a1a', 'Lenient': '#3acf4e', 'Normal': '#ffffff' };
    const ColoredDifficulty = `<color=${Difficulties[DifficultyRaw()] || Difficulties['Normal']}>${DifficultyRaw()}</color>`;
    const AutoplayLabel = (IsAutoEnabled() === true) ? ` (<color=#${Extras.RGB(100)}>Autoplayed</color>)` : '';

    if (CurTile() !== TotalTile()) {
      return `Hit Margin Scale | <size=${MovingMan('MarginScale', 100, 110, 100, 800, 'true')}%>${Lib.GradientText('MarginScale', 25, 100, Hex1, Hex2, MarginScale(MarginDecimals) * 100)}</color>%</size>`;
    }

    if (StartProgress() === 100 && CurTile === -1) return '';

    if (TotalTile() === 0 && StartTile() >= 1) return '';

    if (StartTile() === 1 && Progress(0) === 100) {
      if (XAccuracy() === 100) return `${ColoredDifficulty} Difficulty <color=#ffda00>Pure Perfect!</color>${AutoplayLabel}`;
      if (MissCount() > 0 || Overloads() > 0) return `${ColoredDifficulty} Difficulty <color=#${FOHex()}>${MissCount() + Overloads()} Death <color=#ffffff>(Max Combo <color=#87cefa>${MaxCombo()}<color=#ffffff>)</color>`;
      if (CTE() === 0 && CVE() === 0 && CVL() === 0 && CTL() === 0) return `${ColoredDifficulty} Difficulty <color=#a0ff4e>All Perfect! <color=#ffffff>(Max Combo <color=#87cefa>${MaxCombo()}<color=#ffffff>)</color>`;
      if (CTE() === 0) return `${ColoredDifficulty} Difficulty <color=#87cefa>Full Combo! <color=#ffffff>(Max Combo <color=#87cefa>${MaxCombo()}<color=#ffffff>)</color>`;
      return `${ColoredDifficulty} Difficulty <color=#ffffff>Cleared! <color=#ffffff>(Max Combo <color=#87cefa>${MaxCombo()}<color=#ffffff>)</color>`;
    }

    const ProgressDisplay = `${Lib.GradientText('StartProgress', 0, 100, Hex1, Hex2, StartProgress(ProgressDecimals))}<color=#ffffff>% ~ ${Lib.GradientText('Progress', 0, 100, Hex1, Hex2, Progress(ProgressDecimals))}<color=#ffffff>% `;

    if (XAccuracy() === 100) return ProgressDisplay + `${ColoredDifficulty} Difficulty <color=#ffda00>Pure Perfect!</color>${AutoplayLabel}`;

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
  // Original idea & logic from iTags, Opacity parameter & optimized function from Better iTags Alpha
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
  static ValueBasedColorRange(Value, MinRange, MaxRange, Hex1 = 'ffffff', Hex2 = 'ffffff', Text) {
    return Lib.ValueBasedColorRange(Value, MinRange, MaxRange, Hex1, Hex2, Text);
  }
}

class OtherGamesStyleDisplays {
  // Originally from maimai.js
  static maimaiStyleScoreDisplay(style) {
    let maxAchv = ((TotalTile() - 1)) * 500;
    let missMaxAchv = ((TotalTile() - 1) - MissCount()) * 500;
    let missAchv = MissCount() * 500;
    let perfectAchv = CP() * 500;
    let greatAchv = CELP() * 400;
    let goodAchv = CV() * 250;
    let notPerfectAchv = (CELP() * 100) + goodAchv;
    let reGreatAchv = CELP() * 100;

    let DXScore = (CP() * 3) + (CELP() * 2) + CV();
    let maxDXScore = (TotalTile() - 1) * 3;
    let DXScorePercent = DXScore / maxDXScore * 100;
    let reverseDXScore = maxDXScore - CELP() - (CV() * 2) - (MissCount() * 3);
    let reverseDXScorePercent = reverseDXScore / maxDXScore * 100;
    let minusDXScore = CELP() + (CV() * 2) + (MissCount() * 3);
    let minusDXScorePercent = minusDXScore / maxDXScore * 100;

    let finalScore;

    function statusDetector() {
      if (IsAutoEnabled == true){
        return "auto";
      } else if (IsNoFailEnabled == true){
        return "nofail";
      } else return "normal";
    }

    function rankJudge(score) {
      if (score < 50) return `<color=#919191>D`;
      else if (score < 60) return `C`;
      else if (score < 70) return `<color=#27b7f6>B`;
      else if (score < 75) return `<color=#27b7f6>BB`;
      else if (score < 80) return `<color=#27b7f6>BBB`;
      else if (score < 90) return `<color=#f85d5d>A`;
      else if (score < 94) return `<color=#f85d5d>AA`;
      else if (score < 97) return `<color=#f85d5d>AAA`;
      else if (score < 98) return `<color=#f1e00c>S`;
      else if (score < 99) return `<color=#f1e00c>S<color=#ffffff>+`;
      else if (score < 99.5) return `<color=#f1e00c>SS`;
      else if (score < 100) return `<color=#f1e00c>SS<color=#ffffff>+`;
      else return `<color=#f1e00c>S<color=#27b7f6>S<color=#f85d5d>S`;
    }
    function DXStarJudge(score) {
      if (score < 85) return `-`;
      else if (score < 90) return `<color=#67d300>◆`;
      else if (score < 93) return `<color=#67d300>◆◆`;
      else if (score < 95) return `<color=#ff7800>◆◆◆`;
      else if (score < 97) return `<color=#ff7800>◆◆◆◆`;
      else return `<color=#ffcc0b>◆◆◆◆◆`;
    }

    // Current Achievement Type with Rating
    if (style === "Achv1") {
        finalScore = (perfectAchv + greatAchv + goodAchv) / maxAchv * 100;
        return `<size=75%>Achievement <size=65%><color=#919191>(Current Type)</color>\n<size=150%>${Lib.Pad(parseFloat(finalScore.toFixed(4)), 4)}<size=75%>%<size=100%>\n${rankJudge(finalScore)}`;
    }

    // Minus Achievement Type with Rating
    if (style === "Achv2") {
        finalScore = (missMaxAchv - notPerfectAchv) / maxAchv * 100;
        let GrAchv = reGreatAchv / maxAchv * 100;
        let GoAchv = goodAchv / maxAchv * 100;
        let MAchv = missAchv / maxAchv * 100;
        let TNAchv = GrAchv + GoAchv + MAchv;
        let TAchv = GrAchv + GoAchv;
        switch (statusDetector())
        {
            case "auto":
        }
        return IsNoFailEnabled() == true ? `<size=75%>Achievement <size=65%><color=#919191>(Minus Type)</color>
<size=150%>${Lib.Pad(parseFloat(finalScore.toFixed(4)), 4)}<size=75%>%<size=100%>
${rankJudge(finalScore)}

<color=#ffffff><size=80%>Great<size=70%> -${Lib.Pad(parseFloat(GrAchv.toFixed(4)), 4)}%
<size=80%>Good<size=70%> -${Lib.Pad(parseFloat(GoAchv.toFixed(4)), 4)}%\n<size=80%>Miss<size=70%> -${Lib.Pad(parseFloat(MAchv.toFixed(4)), 4)}%
<size=80%>Total<size=70%> -${Lib.Pad(parseFloat(TNAchv.toFixed(4)), 4)}%`

        : `<size=75%>Achievement <size=65%><color=#919191>(Minus Type)</color>
<size=150%>${Lib.Pad(parseFloat(finalScore.toFixed(4)), 4)}<size=75%>%<size=100%>
${rankJudge(finalScore)}\n\n<color=#ffffff><size=80%>Great<size=70%> -${Lib.Pad(parseFloat(GrAchv.toFixed(4)), 4)}%
<size=80%>Good<size=70%> -${Lib.Pad(parseFloat(GoAchv.toFixed(4)), 4)}%\n<size=80%>Total<size=70%> -${Lib.Pad(parseFloat(TAchv.toFixed(4)), 4)}%`; 
    }

    // Rank S Border Type
    if (style === "BorderS") {
        finalScore = ((missMaxAchv - notPerfectAchv) / maxAchv * 100) - 97;
        return finalScore <= 0 ? `<size=75%>Rank <color=#f1e00c>S </color>Border
<size=150%>-<size=75%>%`
        : `<size=75%>Rank <color=#f1e00c>S </color>Border
<size=150%>${Lib.Pad(parseFloat(finalScore.toFixed(4)), 4)}<size=75%>%`;
    }

    // Rank S+ Border Type
    if (style === "BorderSP") {
        finalScore = ((missMaxAchv - notPerfectAchv) / maxAchv * 100) - 98;
        return finalScore <= 0 ? `<size=75%>Rank <color=#f1e00c>S</color>+ Border
<size=150%>-<size=75%>%`
        : `<size=75%>Rank <color=#f1e00c>S</color>+ Border
<size=150%>${Lib.Pad(parseFloat(finalScore.toFixed(4)), 4)}<size=75%>%`;
    }

    // Rank SS Border Type
    if (style === "BorderSS") {
        finalScore = ((missMaxAchv - notPerfectAchv) / maxAchv * 100) - 99;
        return finalScore <= 0 ? `<size=75%>Rank <color=#f1e00c>SS </color>Border
<size=150%>-<size=75%>%`
        : `<size=75%>Rank <color=#f1e00c>SS </color>Border
<size=150%>${Lib.Pad(parseFloat(finalScore.toFixed(4)), 4)}<size=75%>%`;
    }

    // Rank SS+ Border Type
    if (style === "BorderSSP") {
        finalScore = ((missMaxAchv - notPerfectAchv) / maxAchv * 100) - 99.5;
        return finalScore <= 0 ? `<size=75%>Rank <color=#f1e00c>SS</color>+ Border
<size=150%>-<size=75%>%`
        : `<size=75%>Rank <color=#f1e00c>SS</color>+ Border
<size=150%>${Lib.Pad(parseFloat(finalScore.toFixed(4)), 4)}<size=75%>%`;
    }

    // Current DX Score Type with DX Score Rating
    if (style === "DXS1") {
        return `<size=75%>DX Score <size=65%><color=#919191>(Current Type)</color>
<size=  >${DXScore} <size=100%>/ ${maxDXScore}\n<size=60%>${parseFloat(DXScorePercent.toFixed(2))}%
<size=50%>${DXStarJudge(DXScorePercent)}`;
    }

    // Left / Lost DX Score Type with DX Score Rating
  if (style === "DXS2") {
    return `<size=75%>DX Score <size=65%><color=#919191>(Left / Lost Type)</color>
<size=150%>${reverseDXScore} <size=100%>-${minusDXScore}
<size=75%>${parseFloat(reverseDXScorePercent.toFixed(2))}% <size=60%>-${parseFloat(minusDXScorePercent.toFixed(2))}%
<size=50%>${DXStarJudge(reverseDXScorePercent)}`;
    }
  }
  // Originally from maimai.js
  static maimaiStyleFCAPIndicator() {
    if (MissCount() !== 0) return;
    if (CV() === 0) return CELP() === 0 ? `<color=#ff7800>All Perfect+` : `<color=#ffba57>All Perfect`;
    return `<color=#67d300>Full Combo`;
  }

  static RDStyleResultsDisplay() {
    const Labels = [IsAutoEnabled() === true ? 'Autoplayed' : `Wow! That's awesome!!`,
'You are really good!',
'We make a good team!',
'Not bad I guess...',
'Ugh, you can do better',
'Better call 911, now!']

    const Ratings = ['S+', 'A', 'B', 'C', 'D', 'F'];
    const Suffixs = ['+', '-']
    let Rating;
    let Suffix;

    const Mistakes = CELP() + CV() + CT() + MissCount() + Overloads();
    
    if (Mistakes === 0) Rating = Ratings[0];
    if (Mistakes > 0 && Mistakes <= 5) Rating = Ratings[1];
    if (Mistakes > 5 && Mistakes <= 10) Rating = Ratings[2];
    if (Mistakes > 10 && Mistakes <= 15) Rating = Ratings[3];
    if (Mistakes > 15 && Mistakes <= 20) Rating = Ratings[4];
    if (Mistakes > 20) Rating = Ratings[5];

    Suffix = Rating !== Ratings[0] ? CP() / 2 >= TotalTile() - 1 - StartTile() ? Suffixs[0] : Suffixs[1] : '';

    return Progress() === 100 ? `<size=75%>Your rank
<size=300%>${Rating}${Suffix}
<size=60%><color=#ffff00>Mistakes: ${Mistakes}
${CEP() + CVE() + CTE() + Overloads()} early + ${CLP() + CVL() + CTL() + MissCount()} late = ${Mistakes} offset frames</color>

<size=75%>${Labels[Ratings.indexOf(Rating)]}</size>` : '';
  }
}



// Tag registrations in Overlayer.Scripting mod
registerTag('TileProgressPercentage', function (Hex1, Hex2, Decimals) {
  return Percentages.TilePercentage(Hex1, Hex2, Decimals);
}, true, '[Tag] Progress based on tiles cleared.\nParameters: (Hex1, Hex2, Decimals)')
registerTag('SongProgressPercentage', function (Hex1, Hex2, Decimals) {
  return Percentages.SongPercentage(Hex1, Hex2, Decimals);
}, true, '[Tag] Progress based on song duration.\nParameters: (Hex1, Hex2, Decimals)')
registerTag('StartProgressPercentage', function (Hex1, Hex2, Decimals) {
  return Percentages.StartPercentage(Hex1, Hex2, Decimals);
}, true, '[Tag] Tile-based progress when the level started.\nParameters: (Hex1, Hex2, Decimals)')
registerTag('BestProgressPercentage', function (Hex1, Hex2, Decimals) {
  return Percentages.BestTilePercentage(Hex1, Hex2, Decimals);
}, true, '[Tag] Tile-based best progress achieved in previous attempts.\nParameters: (Hex1, Hex2, Decimals)')

registerTag('MultiProgressPercentageDisplay', function (Hex1, Hex2, Decimals) {
  return Percentages.Display(Hex1, Hex2, Decimals);
}, true, '[UI Component] Displays Start, Current, and Best tile-based progress percentages.\nParameters: (Hex1, Hex2, Decimals)\nDisplayed As: 12.34% ~ 56.78% (Best 90.12%)')


registerTag('Acc', function (Hex1, Hex2, Decimals) {
  return Accuracies.Acc(Hex1, Hex2, Decimals);
}, true, '[Tag] Accuracy (old) percentage.\nParameters: (Hex1, Hex2, Decimals)')
registerTag('XAcc', function (Hex1, Hex2, Decimals) {
  return Accuracies.XAcc(Hex1, Hex2, Decimals);
}, true, '[Tag] X-Accuracy (Max 100%) percentage.\nParameters: (Hex1, Hex2, Decimals)')

registerTag('MaxPossibleAcc', function (Hex1, Hex2, Decimals) {
  return Accuracies.MaxPossibleAcc(Hex1, Hex2, Decimals);
}, true, '[Tag] Maximum possible Accuracy (old) percentage.\nParameters: (Hex1, Hex2, Decimals)')
registerTag('MaxPossibleXAcc', function (Hex1, Hex2, Decimals) {
  return Accuracies.MaxPossibleXAcc(Hex1, Hex2, Decimals);
}, true, '[Tag] Maximum possible X-Accuracy (Max 100%) percentage.\nParameters: (Hex1, Hex2, Decimals)')

registerTag('MultiAccDisplay', function (Hex1, Hex2, Decimals) {
  return Accuracies.AccDisplay(Hex1, Hex2, Decimals);
}, true, '[UI Component] Displays current X-Accuracy and Accuracy.\nParameters: (Hex1, Hex2, Decimals)\nDisplayed As: X-100% (100.01%)')
registerTag('MultiMaxAccDisplay', function (Hex1, Hex2, Decimals) {
  return Accuracies.MaxPossibleAccDisplay(Hex1, Hex2, Decimals);
}, true, '[UI Component] Displays maximum possible X-Accuracy and max possible Accuracy.\nParameters: (Hex1, Hex2, Decimals)\nDisplayed As: X-100% (101.5%)')


registerTag('TileBPM', function (Hex1, Hex2, Decimals, Max) {
  return TileDatas.TBPM(Hex1, Hex2, Decimals, Max);
}, true, '[Tag] Set tile BPM.\nParameters: (Hex1, Hex2, Decimals, Max)')
registerTag('ActualBPM', function (Hex1, Hex2, Decimals, Max) {
  return TileDatas.CBPM(Hex1, Hex2, Decimals, Max);
}, true, '[Tag] Calculated actual BPM.\nParameters: (Hex1, Hex2, Decimals, Max)')

registerTag('KPS', function (Hex1, Hex2, Decimals, Max) {
  return TileDatas.KPS(Hex1, Hex2, Decimals, Max);
}, true, '[Tag] Calculated KPS based on Actual BPM.\nParameters: (Hex1, Hex2, Decimals, Max)')


registerTag('DateDisplay', function (DateHex, TimeHex, ConnectorChar, SpacingsNumber, System, MinorElementsSizePercentage) {
  return SystemDatas.DateDisplay(DateHex, TimeHex, ConnectorChar, SpacingsNumber, System, MinorElementsSizePercentage);
}, true, '[UI Component] Displays current date and time.\nParameters: (DateHex, TimeHex, ConnectorChar, SpacingsNumber)\nDisplayed As: 2026.01.01  00:00:00')

registerTag('CPUDisplay', function (Hex1, Hex2, WarningHex, WarningThresholdPercentage, Decimals) {
  return SystemDatas.CPUDisplay(Hex1, Hex2, WarningHex, WarningThresholdPercentage, Decimals);
}, true, '[Tag] Displays current CPU usage.\nParameters: (Hex1, Hex2, WarningHex, WarningThresholdPercentage, Decimals)')
registerTag('MemoryDisplay', function (Hex1, Hex2, WarningHex, WarningThresholdPercentage, GBDecimals, PercentageDecimals) {
  return SystemDatas.MemoryDisplay(Hex1, Hex2, WarningHex, WarningThresholdPercentage, GBDecimals, PercentageDecimals);
}, true, '[UI Component] Displays current Memory usage.\nParameters: (Hex1, Hex2, WarningHex, WarningThresholdPercentage, GBDecimals, PercentageDecimals)\nDisplayed As: 4GB / 8GB (50%)')

registerTag('FPSDisplay', function (Hex1, Hex2, WarningHex, WarningThreshold, Decimals) {
  return SystemDatas.FPSDisplay(Hex1, Hex2, WarningHex, WarningThreshold, Decimals);
}, true, '[UI Component] Displayes current FPS and the target FPS.\nParameters: (Hex1, Hex2, WarningHex, WarningThreshold, Decimals)\nDisplayed As: 59.97 / 60')
registerTag('FrameTimeDisplay', function (Hex1, Hex2, WarningHex, WarningThresholdMs, Decimals) {
  return SystemDatas.FrameTimeDisplay(Hex1, Hex2, WarningHex, WarningThresholdMs, Decimals);
}, true, '[UI Component] Displays current Frame Time.\nParameters: (Hex1, Hex2, WarningHex, WarningThresholdMs, Decimals)\nDisplayed As: 16.67ms')


registerTag('DurationDisplay', function (Hex1, Hex2) {
  return LevelInfoDisplays.Duration(Hex1, Hex2);
}, true, '[UI Component] Displays current and total duration of the level.\nParameters: (Hex1, Hex2)\nDisplayed As: 1:03 / 3:05')
registerTag('TileProgressDisplay', function (Hex1, Hex2, Hex3) {
  return LevelInfoDisplays.Tile(Hex1, Hex2, Hex3);
}, true, '[UI Component] Displays current tile, total tiles, and tiles left.\nParameters: (Hex1, Hex2, Hex3)\nDisplayed As: 123 / 456 (-333)')

registerTag('TileProgressBar', function (HexPlayed, HexUnplayed, Length, Char) {
  return LevelInfoDisplays.TileProgressBar(HexPlayed, HexUnplayed, Length, Char);
}, true, '[UI Component] Displays a progress bar based on tile progress.\nParameters: (HexPlayed, HexUnplayed, Length, Char)')
registerTag('SongProgressBar', function (HexPlayed, HexUnplayed, Length, Char) {
  return LevelInfoDisplays.SongProgressBar(HexPlayed, HexUnplayed, Length, Char);
}, true, '[UI Component] Displays a progress bar based on song progress.\nParameters: (HexPlayed, HexUnplayed, Length, Char)')

registerTag('TitleDisplay', function (Hex, LineSpacing, SpeedSizePercentage, SecondLineSizePercentage, AuthorSizePercentage) {
  return LevelInfoDisplays.TitleDisplay(Hex, LineSpacing, SpeedSizePercentage, SecondLineSizePercentage, AuthorSizePercentage);
}, true, '[UI Component] Fancy title display of current loaded level.\nParameters: (Hex, LineSpacing, SpeedSizePercentage, SecondLineSizePercentage, AuthorSizePercentage)')


registerTag('AvgInputOffset', function (Hex1, Hex2, Decimals, ThresholdMs) {
  return PlayerPerformanceDisplays.AverageInputOffset(Hex1, Hex2, Decimals, ThresholdMs);
}, true, '[Tag] Average input offset display.\nParameters: (Hex1, Hex2, Decimals, ThresholdMs)')
registerTag('CurInputOffset', function (Decimals) {
  return PlayerPerformanceDisplays.CurInputOffset(Decimals);
}, true, '[Tag] Current tile input offset display with judgment color.\nParameters: (Decimals)')

registerTag('PureComboDisplay', function (Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold) {
  return PlayerPerformanceDisplays.PureComboDisplay(Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold);
}, true, '[UI Component] Displayes Pure Perfect combo.\nParameters: (Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold)')
registerTag('PerfectsComboDisplay', function (Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold) {
  return PlayerPerformanceDisplays.PerfectsComboDisplay(Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold);
}, true, '[UI Component] Displayes Perfects (EPerfect, Perfect, LPerfect) combo.\nParameters: (Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold)')
registerTag('ActualComboDisplay', function (Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold) {
  return PlayerPerformanceDisplays.ActualComboDisplay(Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold);
}, true, '[UI Component] Displayes Actual (Counts up unless Early!!, Late!!, Overload..., Miss... hit) combo.\nParameters: (Hex1, Hex2, MaxTrackedCombos, LabelSizePercentage, LabelHex, Label, ShowThreshold)')

registerTag('AdaptiveComboDisplay', function (Hex1, Hex2) {
  return PlayerPerformanceDisplays.AdaptiveComboDisplay(Hex1, Hex2);
}, true, '[UI Component] Displayess combo based on difficulty and Autoplay status.\nParameters: (Hex1, Hex2)')

registerTag('AdaptiveStatusLabel', function (Hex1, Hex2, ProgressDecimals) {
  return PlayerPerformanceDisplays.AdaptiveStatusLabel(Hex1, Hex2, ProgressDecimals);
}, true, '[UI Component] Displays a status label based on current performance, difficulty, and Margin Scale.\nParameters: (Hex1, Hex2, ProgressDecimals)')


registerTag('RGB', function (OpacityPercentage) {
  return Extras.RGB(OpacityPercentage);
}, true, '[Utility] Generates a color hex that changes over time with specified opacity percentage to create an cycling RGB effect.\nParameters: (OpacityPercentage)\nOriginally from iTags by SamXU1322.')
registerTag('ValueBasedColorRange', function (Value, MinRange, MaxRange, Hex1, Hex2, Text) {
  return Extras.ValueBasedColorRange(Value, MinRange, MaxRange, Hex1, Hex2, Text);
}, true, '[Utility] Generates colored text based on the value within the specified range.\nParameters: (Value, MinRange, MaxRange, Hex1, Hex2, Text)')

registerTag('maimaiStyleScoreDisplay', function (Style) {
  return OtherGamesStyleDisplays.maimaiStyleScoreDisplay(Style);
}, true, '[UI Component] Displays a maimai-style score display based on selected style.\nParameters: (Style), Available Styles: Achv1, Achv2, BorderS, BorderSP, BorderSS, BorderSSP, DXS1, DXS2\nOriginally from maimai.js by MLob_302.')
registerTag('maimaiStyleFCAPIndicator', function () {
  return OtherGamesStyleDisplays.maimaiStyleFCAPIndicator();
}, true, '[Tag] Displays a maimai-style Full Combo / All Perfect indicator.\nOriginally from maimai.js by MLob_302.')

registerTag('RDStyleResultsDisplay', function () {
  return OtherGamesStyleDisplays.RDStyleResultsDisplay()
}, true, '[UI Component] Displayed a Rhythm Doctor style detailed results screen when finishing a level.\nIt is recommended to use a pixel art style font and a larger text size with this tag.')
