package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

/* const dbUser = "desktop-app_client"
const dbPw = "QFiHmp4IJx1X5IDQ"
const uri = "mongodb+srv://" + dbUser + ":" + dbPw + "@rafli.blvcjuk.mongodb.net/?retryWrites=true&w=majority&appName=rafli" */

func main() {

	// Db settings.
	/* serverAPI := mongoOpt.ServerAPI(mongoOpt.ServerAPIVersion1)
	opts := mongoOpt.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI)
	client, err := mongo.Connect(context.TODO(), opts) // Create a new client and connect to the server
	if err != nil {
		panic(err)
	}
	defer func() {
		if err = client.Disconnect(context.TODO()); err != nil {
			panic(err)
		}
	}()
	// Send a ping to confirm a successful connection
	var result bson.M
	if err := client.Database("admin").RunCommand(context.TODO(), bson.D{{Key: "ping", Value: 1}}).Decode(&result); err != nil {
		panic(err)
	}
	fmt.Println("Pinged your deployment. You successfully connected to MongoDB!") */

	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{ // It was "err :="" here.
		Title:         "CCAPTS",
		Width:         1200,
		Height:        700,
		DisableResize: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
