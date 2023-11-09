package main

import (
	"fmt"
	"os"
	"os/signal"
	"runtime/pprof"
	"syscall"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/health"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/internal/version"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"

	cli "github.com/urfave/cli/v2"
)

func serve(cCtx *cli.Context) error {
	cfg := config.Configuration{}

	err := util.ReadConfig(&cfg)
	if err != nil {
		log.Panic().Err(err).Msg("Failed to load configuration")
	}

	err = cfg.InjectPrivateKey(&cfg)
	if err != nil {
		log.Panic().Err(err).Msg("Failed to load secrets private key")
	}

	err = cfg.InjectGrpcToken(&cfg)
	if err != nil {
		log.Panic().Err(err).Msg("Failed to load gRPC token")
	}

	log.Info().Msg("Configuration loaded.")

	ctx, stop := signal.NotifyContext(cCtx.Context, syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	if cfg.Profiling {
		log.Info().Msg("Profiling is enabled, starting CPU profiling...")
		cf, profErr := os.Create("cpu.profile")
		if profErr != nil {
			return fmt.Errorf("could not create file for CPU profiling: %w", profErr)
		}
		profErr = pprof.StartCPUProfile(cf)
		if profErr != nil {
			return profErr
		}
		defer pprof.StopCPUProfile()

		mf, profErr := os.Create("mem.profile")
		if profErr != nil {
			return fmt.Errorf("could not create file for memory profiling: %w", profErr)
		}
		log.Info().Msg("kill signal USR will print Heap Profile to file: mem.profile")
		sigc := make(chan os.Signal, 1)
		signal.Notify(sigc,
			syscall.SIGUSR1)
		go func() {
			<-sigc
			profErr = pprof.WriteHeapProfile(mf)
			if profErr != nil {
				log.Error().Err(profErr).Msg("could not write memprofile file")
			}
		}()
	}
	go func() {
		err = dagent.Serve(ctx, &cfg)
		log.Error().Err(err).Msg("agent stopped with error")
	}()
	<-ctx.Done()
	log.Info().Msg("Graceful termination")
	return err
}

func getHealth(_ *cli.Context) error {
	healthy, err := health.GetHealthy()
	if err != nil {
		log.Error().Err(err).Send()
	}

	if healthy {
		os.Exit(0)
		return nil
	}

	os.Exit(1)
	return nil
}

func main() {
	app := &cli.App{
		Name:     "dagent",
		Version:  version.BuildVersion(),
		HelpName: "dagent",
		Usage:    "cli tool for serving a Docker agent of dyrector.io",
		Action:   serve,

		Commands: []*cli.Command{
			{
				Name:    "health",
				Aliases: []string{"h"},
				Usage:   "Get the health of the agent",
				Action:  getHealth,
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal().Err(err).Send()
	}
}
