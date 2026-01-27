using API.Data;
using API.Entities;
using API.Middleware;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
// builder.Services.AddOpenApi();

// Defining our StoreContext as a service
builder.Services.AddDbContext<StoreContext>(opt =>
{
  // opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")); // For SQLite
  opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddCors();
// Since we are injecting ExceptionMiddleware in the ExceptionMiddleware class we defined, we have to define it as a service
builder.Services.AddTransient<ExceptionMiddleware>();

builder.Services.AddScoped<PaymentsService>();

// Integrating Identity Framework to the app
// Adding this service provides the tables and endpoints we need to mnaage the users and roles in our app
builder.Services.AddIdentityApiEndpoints<User>(opt =>
{
  // We can add here different limitations such ass password requiring upper / lower case, digits, special characters, users info and more...
  opt.User.RequireUniqueEmail = true;
}).AddRoles<IdentityRole>().AddEntityFrameworkStores<StoreContext>(); // The AddEntityFrameworkStores method is used to register the Entity Framework stores for Identity. It will use the StoreContext to store the Identity data.

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>(); // Must be at the top of the middlewares. This is what catches the exceptions so it has to be the last middleware in the middlewares stack

// Enables default file mapping on the current path. This allows to return files from the wwwroot folder
// Files are served from the path specified in IWebHostEnvironment.WebRootPath or IWebHostEnvironment.WebRootFileProvider which defaults to the 'wwwroot' subfolder.
app.UseDefaultFiles();
// Enables static file serving for the current request path. This allows to serve static files from the wwwroot folder
// Files are served from the path specified in IWebHostEnvironment.WebRootPath or IWebHostEnvironment.WebRootFileProvider which defaults to the 'wwwroot' subfolder.
app.UseStaticFiles(); // Goes together with UseDefaultFiles to serve static files such as HTML, CSS, JS, images, etc.

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.MapOpenApi();
// }

// app.UseHttpsRedirection();


app.UseCors(opt =>
{
  // AllowCredentials will allow the browser to send cookies to the server. In production, make sure to specify the exact origin instead of using AllowAnyOrigin which is not allowed when using AllowCredentials due to security reasons.
  opt.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins("https://localhost:3000");
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Another middleware we need to add is for our identity endpoints
app.MapGroup("api").MapIdentityApi<User>(); // This will map all the identity endpoints under the /api path. The MapIdentityApi method is an extension method that maps the identity endpoints for the User type such as register, login, logout, etc.
app.MapFallbackToController("Index", "Fallback"); // This will map all the requests that do not match any other routes to the Index action of the Fallback controller. This is used to serve the React app for any unknown routes. The second parameter is the name of the controller without the "Controller" suffix.

await DbInitializer.InitDb(app);

app.Run();
