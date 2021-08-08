import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Security Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should work', () => {
    const app: Record<string, any> = {
      name: '',
    };
    const options: Record<string, any> = {
      path: '',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('security', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/src/main.ts')).toBeDefined();
        expect(files.find(filename => filename === '/package.json')).toBeDefined();

        expect(tree.readContent('/package.json')).toContain('"helmet":');
        expect(tree.readContent('/src/main.ts')).toEqual(
          "import { NestFactory } from '@nestjs/core';\n" +
            "import { AppModule } from './app/app.module';\n" +
            "import { WinstonLogger } from './app/shared/logger/winston.logger';\n" +
            "import { ValidationPipe } from '@nestjs/common';\n" +
            "import * as helmet from 'helmet';\n" +
            '\n' +
            'async function bootstrap(): Promise<void> {\n' +
            '  const app = await NestFactory.create(AppModule, { logger: new WinstonLogger() });\n' +
            '  app.useGlobalPipes(\n' +
            '    new ValidationPipe({\n' +
            '      transform: true,\n' +
            '    }),\n' +
            '  );\n' +
            "  app.setGlobalPrefix('v1');\n" +
            '  app.use(helmet());\n' +
            '  app.enableCors({\n' +
            "    origin: '*',\n" +
            '    credentials: true,\n' +
            "    exposedHeaders: 'Authorization',\n" +
            "    allowedHeaders: 'authorization, content-type',\n" +
            '  });\n' +
            '  await app.listen(3000);\n' +
            '}\n' +
            'bootstrap();\n',
        );
      });
    });
  });
  it('should manage path', () => {
    const app: Record<string, any> = {
      name: 'foo',
    };
    const options: Record<string, any> = {
      path: 'foo',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('security', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/foo/src/main.ts')).toBeDefined();
        expect(files.find(filename => filename === '/foo/package.json')).toBeDefined();
        expect(tree.readContent('/foo/package.json')).toContain('"helmet":');
      });
    });
  });
});
