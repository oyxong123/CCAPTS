package main

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Error dialog box 
func (a *App) InfoDialog(msg string) {
	runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
        Type:          runtime.InfoDialog,
        Title:         "Info",
        Message:       msg,
    })
}

// Error dialog box 
func (a *App) ErrorDialog(errMsg string) {
	runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
        Type:          runtime.ErrorDialog,
        Title:         "Error",
        Message:       errMsg,
    })
}

// Warning dialog box 
func (a *App) WarningDialog(title string, warnMsg string) bool {
	result, err := runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
        Type:          runtime.QuestionDialog,
        Title:         title,
        Message:       warnMsg,
		Buttons: []string{"Yes", "No"},
		DefaultButton: "Yes",
    })
	if err != nil {
		panic(err)
	}
	if result == "Yes" {
		return true
	} else if result == "No" {
		return false
	}
	return true
}
