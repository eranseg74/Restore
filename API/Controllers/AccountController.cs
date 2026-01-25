using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    // Injecting the SignInManager. The SignInManager also give us access to the UserManager along with more features
    public class AccountController(SignInManager<User> signInManager) : BaseApiController
    {
        [HttpPost("register")]
        public async Task<ActionResult> RegisterUser(RegisterDto registerDto)
        {
            // We are setting the email and the username as the user's email because the login endpoint requires email and password for authentication but the signin method that the login endpoint uses requires username and password. To overcome this we just set the username and email to be with the same value
            var user = new User { UserName = registerDto.Email, Email = registerDto.Email };
            var result = await signInManager.UserManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded) // In case of a failure we will get an array of all the validations that failed
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return ValidationProblem();
            }
            await signInManager.UserManager.AddToRoleAsync(user, "Member");
            return Ok();
        }

        [HttpGet("user-info")]
        // When a user sends a request to this endpoint, one of the features of ASP.NET Core is that it automatically populates the User property of the controller with the claims of the authenticated user based on the JWT token or cookie sent in the request headers. If no cookie or token is sent, the User property will represent an unauthenticated user.
        public async Task<ActionResult> GetUserInfo()
        {
            // The User property is part of the ControllerBase class that our BaseApiController inherits from. The User property represents the currently logged in user
            // The Identity property of the User object contains information about the user's identity, including whether they are authenticated or not
            // We are returning NoContent if the user is not authenticated so the client knows that there is no user info to display and the app can redirect the user to the login page and not crash.
            if (User.Identity?.IsAuthenticated == false) return NoContent();
            var user = await signInManager.UserManager.GetUserAsync(User); // The GetUserAsync method retrieves the user associated with the current claims principal (User)
            if (user == null) return Unauthorized();
            var roles = await signInManager.UserManager.GetRolesAsync(user); // The GetRolesAsync method retrieves the roles associated with the specified user
            return Ok(new
            {
                user.Email,
                user.UserName,
                Roles = roles
            });
        }

        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {
            await signInManager.SignOutAsync(); // This is why we inject the signInManager and not the userManager. We need the SignOutAsync method that is part of the SignInManager class
            return NoContent();
        }

        [Authorize]
        [HttpPost("address")]
        public async Task<ActionResult<Address>> CreateOrUpdateAddress(Address address)
        {
            // We need to get the current user with the address in order to create or update it. GetUsrAsync will only give us the user without the address property
            var user = await signInManager.UserManager.Users.Include(x => x.Address).FirstOrDefaultAsync(x => x.UserName == User.Identity!.Name);
            if (user == null)
            {
                return Unauthorized();
            }
            user.Address = address;
            var result = await signInManager.UserManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest("Problem updating user address");
            }
            return Ok(user.Address);
        }

        [Authorize]
        [HttpGet("address")]
        public async Task<ActionResult<Address>> GetSavedAddress()
        {
            var address = await signInManager.UserManager.Users.Where(x => x.UserName == User.Identity!.Name).Select(x => x.Address).FirstOrDefaultAsync();
            if (address == null)
            {
                return NoContent();
            }
            return Ok(address);
        }
    }
}
