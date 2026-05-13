package model

type Player struct {
	ID       string  `json:"id"`
	Username string  `json:"username"`
	X        float64 `json:"x"`
	Y        float64 `json:"y"`
	Seed     int64   `json:"seed"`
}
