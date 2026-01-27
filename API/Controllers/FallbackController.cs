using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    // This is a fallback controller that will catch all the requests that do not match any other routes. Note that we need to define this controller because there are routing going on in the client that the server does not know how to handle them so we need a fallback so whenever the server encounters an unknown route it will pass it to the client to handle the route. Note that the difference here is that this controller inherits from the Controller class which does support view component as opposed to the rest of the controllers that inherit from the BaseApiController we created, which inherits from the ControllerBase class which does not support the View component, but only the Model and Controller components without the View component. This is due to the fact that this application uses React as its View component. The View refers to an HTML file that we are returning from this controller
    [AllowAnonymous]
    public class FallbackController : Controller
    {
        public IActionResult Index()
        {
            return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html"), "text/HTML");
        }
    }
}
