$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

function New-Brush([string]$hex) {
    return [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function New-Pen([string]$hex, [float]$width = 1.0) {
    return [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($hex), $width)
}

function New-Font([string]$name, [float]$size, [System.Drawing.FontStyle]$style = [System.Drawing.FontStyle]::Regular) {
    return [System.Drawing.Font]::new($name, $size, $style)
}

function New-RoundedRectPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function Draw-RoundedBox {
    param(
        $g,
        [float]$x,
        [float]$y,
        [float]$w,
        [float]$h,
        [string]$title,
        [string]$subtitle,
        [string[]]$lines,
        [string]$fill = '#FFFFFF',
        [string]$head = '#EAF1FF',
        [string]$border = '#9EB7DE'
    )

    $bodyBrush = New-Brush $fill
    $headBrush = New-Brush $head
    $borderPen = New-Pen $border 2
    $textBrush = New-Brush '#223955'
    $titleBrush = New-Brush '#153A73'
    $subBrush = New-Brush '#5D759A'
    $titleFont = New-Font 'Arial' 16 ([System.Drawing.FontStyle]::Bold)
    $subFont = New-Font 'Arial' 11 ([System.Drawing.FontStyle]::Italic)
    $lineFont = New-Font 'Arial' 11 ([System.Drawing.FontStyle]::Regular)
    $sepPen = New-Pen '#D7E2F0' 1

    $path = New-RoundedRectPath $x $y $w $h 16
    $g.FillPath($bodyBrush, $path)
    $g.DrawPath($borderPen, $path)

    $headerRect = [System.Drawing.RectangleF]::new($x, $y, $w, 44)
    $g.FillRectangle($headBrush, $headerRect)
    $g.DrawLine($sepPen, $x, $y + 78, $x + $w, $y + 78)

    $g.DrawString($title, $titleFont, $titleBrush, $x + 16, $y + 12)
    if ($subtitle) {
        $g.DrawString($subtitle, $subFont, $subBrush, $x + 16, $y + 52)
    }

    $currentY = $y + 92
    foreach ($line in $lines) {
        $g.DrawString($line, $lineFont, $textBrush, $x + 16, $currentY)
        $currentY += 21
    }

    $path.Dispose()
    $bodyBrush.Dispose()
    $headBrush.Dispose()
    $borderPen.Dispose()
    $textBrush.Dispose()
    $titleBrush.Dispose()
    $subBrush.Dispose()
    $titleFont.Dispose()
    $subFont.Dispose()
    $lineFont.Dispose()
    $sepPen.Dispose()
}

function Draw-ArrowLine {
    param(
        $g,
        [float]$x1,
        [float]$y1,
        [float]$x2,
        [float]$y2,
        [string]$color = '#5D82BE',
        [string]$label = '',
        [float]$labelX = 0,
        [float]$labelY = 0
    )

    $pen = New-Pen $color 2.4
    $pen.CustomEndCap = [System.Drawing.Drawing2D.AdjustableArrowCap]::new(5, 7)
    $g.DrawLine($pen, $x1, $y1, $x2, $y2)
    if ($label) {
        $font = New-Font 'Arial' 10
        $brush = New-Brush '#4B6387'
        $g.DrawString($label, $font, $brush, $labelX, $labelY)
        $font.Dispose()
        $brush.Dispose()
    }
    $pen.Dispose()
}

function Draw-Association {
    param(
        $g,
        [float]$x1,
        [float]$y1,
        [float]$x2,
        [float]$y2,
        [string]$leftMult,
        [string]$rightMult,
        [string]$label,
        [float]$labelX,
        [float]$labelY
    )

    Draw-ArrowLine -g $g -x1 $x1 -y1 $y1 -x2 $x2 -y2 $y2 -label $label -labelX $labelX -labelY $labelY
    $font = New-Font 'Arial' 10
    $brush = New-Brush '#4B6387'
    $g.DrawString($leftMult, $font, $brush, $x1 - 8, $y1 - 20)
    $g.DrawString($rightMult, $font, $brush, $x2 + 4, $y2 - 20)
    $font.Dispose()
    $brush.Dispose()
}

function Draw-Actor {
    param($g, [float]$x, [float]$y, [string]$name)
    $pen = New-Pen '#1E2D46' 4
    $brush = New-Brush '#1E2D46'
    $font = New-Font 'Arial' 15 ([System.Drawing.FontStyle]::Bold)
    $g.DrawEllipse($pen, $x - 22, $y - 72, 44, 44)
    $g.DrawLine($pen, $x, $y - 28, $x, $y + 38)
    $g.DrawLine($pen, $x - 36, $y - 2, $x + 36, $y - 2)
    $g.DrawLine($pen, $x, $y + 38, $x - 30, $y + 88)
    $g.DrawLine($pen, $x, $y + 38, $x + 30, $y + 88)
    $g.DrawString($name, $font, $brush, $x - 58, $y + 104)
    $pen.Dispose()
    $brush.Dispose()
    $font.Dispose()
}

function Draw-UseCase {
    param($g, [float]$x, [float]$y, [float]$w, [float]$h, [string]$text)
    $fill = New-Brush '#EEF4FF'
    $pen = New-Pen '#7F9CD2' 2
    $font = New-Font 'Arial' 11
    $brush = New-Brush '#1F3557'
    $g.FillEllipse($fill, $x, $y, $w, $h)
    $g.DrawEllipse($pen, $x, $y, $w, $h)
    $rect = [System.Drawing.RectangleF]::new($x + 10, $y + 11, $w - 20, $h - 22)
    $sf = [System.Drawing.StringFormat]::new()
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($text, $font, $brush, $rect, $sf)
    $fill.Dispose()
    $pen.Dispose()
    $font.Dispose()
    $brush.Dispose()
    $sf.Dispose()
}

function Draw-EntityRect {
    param(
        $g,
        [float]$x,
        [float]$y,
        [float]$w,
        [float]$h,
        [string]$title,
        [string[]]$lines
    )

    $fill = New-Brush '#FFFFFF'
    $pen = New-Pen '#7D90AF' 2
    $headBrush = New-Brush '#F0F4FA'
    $titleBrush = New-Brush '#202C3F'
    $textBrush = New-Brush '#26364F'
    $titleFont = New-Font 'Arial' 12 ([System.Drawing.FontStyle]::Bold)
    $textFont = New-Font 'Arial' 10
    $sepPen = New-Pen '#CCD7E7' 1

    $g.FillRectangle($fill, $x, $y, $w, $h)
    $g.DrawRectangle($pen, $x, $y, $w, $h)
    $g.FillRectangle($headBrush, $x, $y, $w, 26)
    $g.DrawLine($sepPen, $x, $y + 26, $x + $w, $y + 26)
    $g.DrawString($title, $titleFont, $titleBrush, $x + 10, $y + 6)

    $currentY = $y + 38
    foreach ($line in $lines) {
        $g.DrawString($line, $textFont, $textBrush, $x + 10, $currentY)
        $currentY += 18
    }

    $fill.Dispose()
    $pen.Dispose()
    $headBrush.Dispose()
    $titleBrush.Dispose()
    $textBrush.Dispose()
    $titleFont.Dispose()
    $textFont.Dispose()
    $sepPen.Dispose()
}

function Draw-RelationOval {
    param(
        $g,
        [float]$x,
        [float]$y,
        [float]$w,
        [float]$h,
        [string]$text
    )

    $fill = New-Brush '#FFFFFF'
    $pen = New-Pen '#4A4A4A' 1.8
    $font = New-Font 'Arial' 11
    $brush = New-Brush '#1F1F1F'
    $sf = [System.Drawing.StringFormat]::new()
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    $g.FillEllipse($fill, $x, $y, $w, $h)
    $g.DrawEllipse($pen, $x, $y, $w, $h)
    $g.DrawString($text, $font, $brush, [System.Drawing.RectangleF]::new($x, $y, $w, $h), $sf)

    $fill.Dispose()
    $pen.Dispose()
    $font.Dispose()
    $brush.Dispose()
    $sf.Dispose()
}

function Draw-ERConnection {
    param(
        $g,
        [float]$x1,
        [float]$y1,
        [float]$x2,
        [float]$y2,
        [string]$leftCard = '',
        [float]$leftX = 0,
        [float]$leftY = 0,
        [string]$rightCard = '',
        [float]$rightX = 0,
        [float]$rightY = 0
    )

    $pen = New-Pen '#4F77B8' 2
    $font = New-Font 'Arial' 10
    $brush = New-Brush '#2E4F86'
    $g.DrawLine($pen, $x1, $y1, $x2, $y2)
    if ($leftCard) { $g.DrawString($leftCard, $font, $brush, $leftX, $leftY) }
    if ($rightCard) { $g.DrawString($rightCard, $font, $brush, $rightX, $rightY) }
    $pen.Dispose()
    $font.Dispose()
    $brush.Dispose()
}

function New-Canvas([int]$width, [int]$height) {
    $bmp = [System.Drawing.Bitmap]::new($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#F4F7FB'))
    return @{ Bitmap = $bmp; Graphics = $g }
}

function Save-Canvas($canvas, [string]$path) {
    $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Graphics.Dispose()
    $canvas.Bitmap.Dispose()
}

$outDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Class diagram as real DB tables
$class = New-Canvas 1700 1300
$g = $class.Graphics

$titleBrush = New-Brush '#14386F'
$titleFont = New-Font 'Arial' 24 ([System.Drawing.FontStyle]::Bold)
$subBrush = New-Brush '#5F759A'
$subFont = New-Font 'Arial' 13
$g.DrawString('Diagramme de classes - version base de donnees', $titleFont, $titleBrush, 50, 30)
$g.DrawString('BaseEntity n''est pas une table : j''affiche ici directement les vraies tables avec leurs colonnes communes.', $subFont, $subBrush, 50, 62)
$titleBrush.Dispose(); $titleFont.Dispose(); $subBrush.Dispose(); $subFont.Dispose()

Draw-RoundedBox -g $g -x 60 -y 150 -w 340 -h 250 -title 'specialites' -subtitle 'Table' -lines @(
    'id : BIGINT (PK)',
    'nom : VARCHAR(120)',
    'description : VARCHAR(500)',
    'actif : BOOLEAN',
    'created_at : DATETIME',
    'updated_at : DATETIME'
)

Draw-RoundedBox -g $g -x 470 -y 150 -w 420 -h 355 -title 'utilisateurs' -subtitle 'Table' -lines @(
    'id : BIGINT (PK)',
    'matricule : VARCHAR(40)',
    'prenom : VARCHAR(80)',
    'nom : VARCHAR(80)',
    'email : VARCHAR(150)',
    'telephone : VARCHAR(30)',
    'mot_de_passe : VARCHAR(255)',
    'role : ENUM(Role)',
    'specialite_id : BIGINT (FK)',
    'actif : BOOLEAN',
    'created_at : DATETIME',
    'updated_at : DATETIME'
)

Draw-RoundedBox -g $g -x 960 -y 150 -w 460 -h 380 -title 'missions' -subtitle 'Table' -lines @(
    'id : BIGINT (PK)',
    'code : VARCHAR(40)',
    'titre : VARCHAR(150)',
    'description : VARCHAR(1500)',
    'client_nom : VARCHAR(120)',
    'localisation : VARCHAR(120)',
    'date_debut : DATE',
    'date_fin : DATE',
    'status : ENUM(MissionStatus)',
    'priorite : ENUM(Priorite)',
    'budget : DECIMAL(12,2)',
    'actif : BOOLEAN',
    'created_at : DATETIME',
    'updated_at : DATETIME'
)

Draw-RoundedBox -g $g -x 560 -y 620 -w 470 -h 335 -title 'affectations' -subtitle 'Table' -lines @(
    'id : BIGINT (PK)',
    'employe_id : BIGINT (FK)',
    'mission_id : BIGINT (FK)',
    'date_debut : DATE',
    'date_fin : DATE',
    'taux_occupation : INT',
    'status : ENUM(AffectationStatus)',
    'commentaire : VARCHAR(800)',
    'actif : BOOLEAN',
    'created_at : DATETIME',
    'updated_at : DATETIME'
)

Draw-RoundedBox -g $g -x 90 -y 1060 -w 280 -h 120 -title 'Role' -subtitle 'Enumeration' -lines @(
    'ADMIN',
    'EMPLOYE'
) -fill '#FFFDFE'

Draw-RoundedBox -g $g -x 430 -y 1040 -w 370 -h 145 -title 'MissionStatus' -subtitle 'Enumeration' -lines @(
    'PLANIFIEE',
    'EN_COURS',
    'TERMINEE',
    'ANNULEE'
) -fill '#FFFDFE'

Draw-RoundedBox -g $g -x 860 -y 1060 -w 300 -h 120 -title 'Priorite' -subtitle 'Enumeration' -lines @(
    'BASSE',
    'MOYENNE',
    'HAUTE'
) -fill '#FFFDFE'

Draw-RoundedBox -g $g -x 1210 -y 1040 -w 360 -h 145 -title 'AffectationStatus' -subtitle 'Enumeration' -lines @(
    'PLANIFIEE',
    'ACTIVE',
    'TERMINEE'
) -fill '#FFFDFE'

Draw-Association -g $g -x1 400 -y1 275 -x2 470 -y2 275 -leftMult '1' -rightMult '0..*' -label 'specialite' -labelX 408 -labelY 294
Draw-Association -g $g -x1 700 -y1 505 -x2 700 -y2 620 -leftMult '1' -rightMult '0..*' -label 'employe' -labelX 712 -labelY 555
Draw-Association -g $g -x1 1110 -y1 530 -x2 980 -y2 620 -leftMult '1' -rightMult '0..*' -label 'mission' -labelX 1050 -labelY 555

Draw-ArrowLine -g $g -x1 680 -y1 505 -x2 235 -y2 1060 -label 'role' -labelX 450 -labelY 800
Draw-ArrowLine -g $g -x1 1170 -y1 530 -x2 615 -y2 1040 -label 'status' -labelX 930 -labelY 760
Draw-ArrowLine -g $g -x1 1220 -y1 530 -x2 1010 -y2 1060 -label 'priorite' -labelX 1140 -labelY 800
Draw-ArrowLine -g $g -x1 910 -y1 955 -x2 1390 -y2 1040 -label 'status' -labelX 1140 -labelY 980

$noteBrush = New-Brush '#5F759A'
$noteFont = New-Font 'Arial' 12
$g.DrawString('Lecture : specialites, utilisateurs, missions et affectations sont les vraies tables. Les colonnes id / actif / created_at / updated_at viennent du code BaseEntity mais existent physiquement dans chaque table.', $noteFont, $noteBrush, 50, 1235)
$noteBrush.Dispose(); $noteFont.Dispose()

Save-Canvas $class (Join-Path $outDir 'class-diagram-db.png')

# ER diagram
$er = New-Canvas 1800 1250
$g = $er.Graphics

$titleBrush = New-Brush '#14386F'
$titleFont = New-Font 'Arial' 25 ([System.Drawing.FontStyle]::Bold)
$subBrush = New-Brush '#5F759A'
$subFont = New-Font 'Arial' 13
$g.DrawString('Schema entites-relationnel - Plateforme Missions', $titleFont, $titleBrush, 55, 28)
$g.DrawString('Representation de la structure de donnees reelle de l''application (tables, PK, FK, cardinalites).', $subFont, $subBrush, 55, 60)
$titleBrush.Dispose(); $titleFont.Dispose(); $subBrush.Dispose(); $subFont.Dispose()

Draw-RoundedBox -g $g -x 70 -y 170 -w 430 -h 305 -title 'specialites' -subtitle 'Entite / Table' -lines @(
    '[PK] id : BIGINT',
    'nom : VARCHAR(120) [UNIQUE]',
    'description : VARCHAR(500)',
    'actif : BOOLEAN',
    'created_at : DATETIME',
    'updated_at : DATETIME'
)

Draw-RoundedBox -g $g -x 650 -y 120 -w 500 -h 470 -title 'utilisateurs' -subtitle 'Entite / Table' -lines @(
    '[PK] id : BIGINT',
    'matricule : VARCHAR(40) [UNIQUE]',
    'prenom : VARCHAR(80)',
    'nom : VARCHAR(80)',
    'email : VARCHAR(150) [UNIQUE]',
    'telephone : VARCHAR(30)',
    'mot_de_passe : VARCHAR(255)',
    'role : VARCHAR(20)',
    '[FK] specialite_id : BIGINT NULL',
    'actif : BOOLEAN',
    'created_at : DATETIME',
    'updated_at : DATETIME'
)

Draw-RoundedBox -g $g -x 1270 -y 120 -w 470 -h 495 -title 'missions' -subtitle 'Entite / Table' -lines @(
    '[PK] id : BIGINT',
    'code : VARCHAR(40) [UNIQUE]',
    'titre : VARCHAR(150)',
    'description : VARCHAR(1500)',
    'client_nom : VARCHAR(120)',
    'localisation : VARCHAR(120)',
    'date_debut : DATE',
    'date_fin : DATE',
    'status : VARCHAR(20)',
    'priorite : VARCHAR(20)',
    'budget : DECIMAL(12,2)',
    'actif : BOOLEAN',
    'created_at : DATETIME',
    'updated_at : DATETIME'
)

Draw-RoundedBox -g $g -x 820 -y 720 -w 560 -h 360 -title 'affectations' -subtitle 'Entite associative / Table' -lines @(
    '[PK] id : BIGINT',
    '[FK] employe_id : BIGINT NOT NULL',
    '[FK] mission_id : BIGINT NOT NULL',
    'date_debut : DATE',
    'date_fin : DATE',
    'taux_occupation : INT',
    'status : VARCHAR(20)',
    'commentaire : VARCHAR(800)',
    'actif : BOOLEAN',
    'created_at : DATETIME',
    'updated_at : DATETIME'
)

Draw-RoundedBox -g $g -x 80 -y 630 -w 560 -h 220 -title 'Domaines et contraintes metier' -subtitle 'Reference utile pour lecture' -lines @(
    'Role = ADMIN / EMPLOYE',
    'MissionStatus = PLANIFIEE / EN_COURS / TERMINEE / ANNULEE',
    'Priorite = BASSE / MOYENNE / HAUTE',
    'AffectationStatus = PLANIFIEE / ACTIVE / TERMINEE',
    'specialite_id est nullable pour autoriser les ADMIN sans specialite'
) -fill '#FFFDFE'

Draw-RoundedBox -g $g -x 80 -y 920 -w 560 -h 180 -title 'Lecture des cardinalites' -subtitle 'Interpretation relationnelle' -lines @(
    'Une specialite peut concerner 0..N utilisateurs.',
    'Un utilisateur appartient a 0..1 specialite.',
    'Un utilisateur peut avoir 0..N affectations.',
    'Une mission peut avoir 0..N affectations.'
) -fill '#FFFDFE'

Draw-Association -g $g -x1 500 -y1 300 -x2 650 -y2 300 -leftMult '1' -rightMult '0..N' -label 'specialite_id' -labelX 535 -labelY 320
Draw-Association -g $g -x1 850 -y1 590 -x2 1040 -y2 720 -leftMult '1' -rightMult '0..N' -label 'employe_id' -labelX 905 -labelY 645
Draw-Association -g $g -x1 1420 -y1 615 -x2 1210 -y2 720 -leftMult '1' -rightMult '0..N' -label 'mission_id' -labelX 1312 -labelY 655

$legendPen = New-Pen '#C9D6EA' 2
$legendBrush = New-Brush '#173D7A'
$legendFont = New-Font 'Arial' 12 ([System.Drawing.FontStyle]::Bold)
$textFont = New-Font 'Arial' 11
$textBrush = New-Brush '#243955'
$g.DrawRectangle($legendPen, 1440, 760, 270, 210)
$g.DrawString('Legende', $legendFont, $legendBrush, 1460, 785)
$g.DrawString('[PK] = cle primaire', $textFont, $textBrush, 1460, 825)
$g.DrawString('[FK] = cle etrangere', $textFont, $textBrush, 1460, 850)
$g.DrawString('[UNIQUE] = contrainte', $textFont, $textBrush, 1460, 875)
$g.DrawString('0..N = zero a plusieurs', $textFont, $textBrush, 1460, 900)
$g.DrawString('0..1 = zero ou un', $textFont, $textBrush, 1460, 925)
$legendPen.Dispose(); $legendBrush.Dispose(); $legendFont.Dispose(); $textFont.Dispose(); $textBrush.Dispose()

$noteBrush = New-Brush '#5F759A'
$noteFont = New-Font 'Arial' 12
$g.DrawString('Remarque : BaseEntity est une classe Java technique. Elle ne devient pas une table separee ; ses colonnes sont materialisees dans chaque table metier.', $noteFont, $noteBrush, 55, 1165)
$noteBrush.Dispose(); $noteFont.Dispose()

Save-Canvas $er (Join-Path $outDir 'er-diagram.png')

# Entity-relationship diagram in classic notation
$ea = New-Canvas 1700 950
$g = $ea.Graphics

$titleBrush = New-Brush '#14386F'
$titleFont = New-Font 'Arial' 24 ([System.Drawing.FontStyle]::Bold)
$subBrush = New-Brush '#5F759A'
$subFont = New-Font 'Arial' 13
$g.DrawString('Schema entite-relationnel (notation entite-association)', $titleFont, $titleBrush, 48, 28)
$g.DrawString('Vue conceptuelle des entites principales et de leurs relations, comme dans un MCD / ERD academique.', $subFont, $subBrush, 48, 60)
$titleBrush.Dispose(); $titleFont.Dispose(); $subBrush.Dispose(); $subFont.Dispose()

Draw-EntityRect -g $g -x 60 -y 170 -w 250 -h 150 -title 'Specialite' -lines @(
    'id_specialite : integer',
    'nom : string',
    'description : string'
)

Draw-EntityRect -g $g -x 660 -y 150 -w 300 -h 235 -title 'Utilisateur' -lines @(
    'id_utilisateur : integer',
    'matricule : string',
    'prenom : string',
    'nom : string',
    'email : string',
    'telephone : string',
    'mot_de_passe : string',
    'role : string'
)

Draw-EntityRect -g $g -x 1280 -y 170 -w 280 -h 255 -title 'Mission' -lines @(
    'id_mission : integer',
    'code : string',
    'titre : string',
    'description : string',
    'client_nom : string',
    'localisation : string',
    'date_debut : date',
    'date_fin : date',
    'status : string',
    'priorite : string'
)

Draw-EntityRect -g $g -x 740 -y 610 -w 360 -h 215 -title 'Affectation' -lines @(
    'id_affectation : integer',
    'date_debut : date',
    'date_fin : date',
    'taux_occupation : integer',
    'status : string',
    'commentaire : string'
)

Draw-RelationOval -g $g -x 405 -y 200 -w 170 -h 68 -text "appartient a"
Draw-RelationOval -g $g -x 510 -y 470 -w 190 -h 72 -text "est affecte via"
Draw-RelationOval -g $g -x 1130 -y 470 -w 190 -h 72 -text "concerne"

Draw-ERConnection -g $g -x1 310 -y1 245 -x2 405 -y2 234 -leftCard '0,n' -leftX 330 -leftY 214 -rightCard '0,1' -rightX 386 -rightY 214
Draw-ERConnection -g $g -x1 575 -y1 234 -x2 660 -y2 245 -leftCard '0,1' -leftX 587 -leftY 214 -rightCard '1,1' -rightX 620 -rightY 214

Draw-ERConnection -g $g -x1 780 -y1 385 -x2 610 -y2 470 -leftCard '1,n' -leftX 715 -leftY 395 -rightCard '1,1' -rightX 640 -rightY 440
Draw-ERConnection -g $g -x1 610 -y1 542 -x2 860 -y2 610 -leftCard '1,1' -leftX 645 -leftY 550 -rightCard '0,n' -rightX 792 -rightY 575

Draw-ERConnection -g $g -x1 1360 -y1 425 -x2 1225 -y2 470 -leftCard '1,n' -leftX 1300 -leftY 430 -rightCard '1,1' -rightX 1235 -rightY 442
Draw-ERConnection -g $g -x1 1225 -y1 542 -x2 960 -y2 610 -leftCard '1,1' -leftX 1215 -leftY 552 -rightCard '0,n' -rightX 980 -rightY 576

$noteBrush = New-Brush '#5F759A'
$noteFont = New-Font 'Arial' 12
$g.DrawString('Interpretation : une specialite peut etre attribuee a plusieurs utilisateurs ; une affectation associe un utilisateur a une mission et porte ses propres attributs.', $noteFont, $noteBrush, 48, 892)
$noteBrush.Dispose()
$noteFont.Dispose()

Save-Canvas $ea (Join-Path $outDir 'schema-entite-relationnel.png')

# Use case png
$uc = New-Canvas 1450 1000
$g = $uc.Graphics

$titleBrush = New-Brush '#14386F'
$titleFont = New-Font 'Arial' 24 ([System.Drawing.FontStyle]::Bold)
$subBrush = New-Brush '#5F759A'
$subFont = New-Font 'Arial' 13
$g.DrawString('Diagramme de use case - Backend', $titleFont, $titleBrush, 50, 30)
$g.DrawString('Acteurs et fonctions principales du serveur Spring Boot.', $subFont, $subBrush, 50, 62)
$titleBrush.Dispose(); $titleFont.Dispose(); $subBrush.Dispose(); $subFont.Dispose()

$sysBrush = New-Brush '#FFFFFF'
$sysPen = New-Pen '#C9D6EA' 2.5
$sysPath = New-RoundedRectPath 280 120 880 780 24
$g.FillPath($sysBrush, $sysPath)
$g.DrawPath($sysPen, $sysPath)
$labelBrush = New-Brush '#194280'
$labelFont = New-Font 'Arial' 17 ([System.Drawing.FontStyle]::Bold)
$g.DrawString('Plateforme de gestion des missions - Backend', $labelFont, $labelBrush, 310, 150)
$sysBrush.Dispose(); $sysPen.Dispose(); $sysPath.Dispose(); $labelBrush.Dispose(); $labelFont.Dispose()

Draw-Actor -g $g -x 110 -y 290 -name 'Administrateur'
Draw-Actor -g $g -x 1310 -y 340 -name 'Employe'

Draw-UseCase -g $g -x 360 -y 210 -w 220 -h 72 -text "S'authentifier"
Draw-UseCase -g $g -x 700 -y 210 -w 250 -h 72 -text 'Consulter mon profil'
Draw-UseCase -g $g -x 330 -y 340 -w 280 -h 72 -text 'Consulter le dashboard admin'
Draw-UseCase -g $g -x 700 -y 340 -w 250 -h 72 -text 'Gerer les utilisateurs'
Draw-UseCase -g $g -x 360 -y 470 -w 220 -h 72 -text 'Gerer les specialites'
Draw-UseCase -g $g -x 720 -y 470 -w 210 -h 72 -text 'Gerer les missions'
Draw-UseCase -g $g -x 350 -y 600 -w 240 -h 72 -text 'Gerer les affectations'
Draw-UseCase -g $g -x 660 -y 600 -w 330 -h 72 -text "Consulter l'equipe d'une mission"
Draw-UseCase -g $g -x 700 -y 730 -w 250 -h 72 -text 'Consulter mes missions'

$linkPen = New-Pen '#7A95C5' 2.2
$g.DrawLine($linkPen, 146, 245, 360, 245)
$g.DrawLine($linkPen, 146, 270, 700, 245)
$g.DrawLine($linkPen, 146, 300, 330, 375)
$g.DrawLine($linkPen, 146, 335, 700, 375)
$g.DrawLine($linkPen, 140, 370, 360, 505)
$g.DrawLine($linkPen, 138, 405, 720, 505)
$g.DrawLine($linkPen, 130, 440, 350, 635)
$g.DrawLine($linkPen, 130, 475, 660, 635)
$g.DrawLine($linkPen, 1270, 245, 950, 245)
$g.DrawLine($linkPen, 1270, 350, 990, 635)
$g.DrawLine($linkPen, 1270, 382, 950, 765)
$linkPen.Dispose()

$noteBrush = New-Brush '#5F759A'
$noteFont = New-Font 'Arial' 12
$g.DrawString('Important : il n''y a pas d''inscription publique libre dans le backend actuel. Les comptes sont crees par l''administrateur.', $noteFont, $noteBrush, 310, 930)
$noteBrush.Dispose(); $noteFont.Dispose()

Save-Canvas $uc (Join-Path $outDir 'use-case-diagram.png')

Write-Output 'OK'
