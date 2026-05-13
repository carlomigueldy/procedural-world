package world

type TileType int

const (
	TileWaterDeep    TileType = 0
	TileWaterShallow TileType = 1
	TileSand         TileType = 2
	TileGrass        TileType = 3
	TileForest       TileType = 4
	TileStone        TileType = 5
	TileSnow         TileType = 6
)

type Generator struct {
	seed int64
}

func NewGenerator(seed int64) *Generator {
	return &Generator{seed: seed}
}

func (g *Generator) Seed() int64 {
	return g.seed
}
